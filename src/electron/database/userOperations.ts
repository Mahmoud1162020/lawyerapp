import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import bcrypt from 'bcrypt';
import { app } from 'electron';

const saltRounds = 10;
////data base////////////////////////////////
export async function initializeDatabase(): Promise<Database> {
  const db = await open({
    filename: path.join(app.getPath("userData"), "appdatabase.sqlite"),
    driver: sqlite3.Database,
  });
console.log('====================================');
console.log(path.join(app.getPath("userData"), "appdatabase.sqlite"));
console.log('====================================');
  // ✅ Ensure the "meta" table exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // ✅ Apply migrations
  await applyMigrations(db);

  return db;
}

async function applyMigrations(db: Database) {
  let currentVersion = await getDatabaseVersion(db);

  if (currentVersion < 1) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      );
    `);
    await db.run(`INSERT INTO meta (key, value) VALUES ('db_version', '1') ON CONFLICT(key) DO UPDATE SET value='1'`);
    currentVersion = 1;
  }

  if (currentVersion < 2) {
    const roleColumnExists = await db.get(`
      SELECT 1 
      FROM pragma_table_info('users') 
      WHERE name = 'role'
    `);

    if (!roleColumnExists) {
      await db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';`);
      console.log("Database updated to version 2: Added 'role' column.");
    }

    await db.run(`UPDATE meta SET value = '2' WHERE key = 'db_version'`);
    currentVersion = 2;
  }

  if (currentVersion < 3) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      recipient TEXT NOT NULL,
      amount REAL NOT NULL,
      report TEXT,
      procedureId INTEGER NOT NULL,
      type TEXT CHECK(type IN ('procedure', 'personal')) NOT NULL,
      date TEXT DEFAULT (datetime('now', 'localtime')), 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (procedureId) REFERENCES procedures(id) ON DELETE CASCADE
      );
    `);
    await db.run(`UPDATE meta SET value = '3' WHERE key = 'db_version'`);
    console.log("Database updated to version 3: Added 'transactions' table.");
    currentVersion = 3;
  }

  if (currentVersion < 4) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS customersaccount (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        accountNumber TEXT NOT NULL,
        accountType TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        date TEXT DEFAULT (datetime('now', 'localtime')),
        details TEXT,
        name TEXT
      );
    `);
    await db.run(`UPDATE meta SET value = '4' WHERE key = 'db_version'`);
    console.log("Database updated to version 4: Added 'customersaccount' table.");
    currentVersion = 4;
  }

  if (currentVersion < 5) {
    await db.run(`UPDATE meta SET value = '5' WHERE key = 'db_version'`);
    console.log("Database updated to version 5.");
    currentVersion = 5;
  }

  if (currentVersion < 6) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS realstates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        propertyTitle TEXT NOT NULL,
        propertyNumber TEXT NOT NULL,
        address TEXT NOT NULL,
        price REAL NOT NULL,
        date TEXT DEFAULT (datetime('now', 'localtime')),
        details TEXT
      );
    `);
    await db.run(`UPDATE meta SET value = '6' WHERE key = 'db_version'`);
    console.log("Database updated to version 6: Added 'realstates' table.");
    currentVersion = 6;
  }

  if (currentVersion < 7) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS realstate_owners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        realstate_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        FOREIGN KEY (realstate_id) REFERENCES realstates(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customersaccount(id) ON DELETE CASCADE
      );
    `);
    await db.run(`UPDATE meta SET value = '7' WHERE key = 'db_version'`);
    console.log("Database updated to version 7: Added 'realstate_owners' table.");
    currentVersion = 7;
  }

  if (currentVersion < 8) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS procedures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        procedureNumber TEXT NOT NULL,
        procedureName TEXT NOT NULL,
        description TEXT,
        date TEXT DEFAULT (datetime('now', 'localtime')),
        status TEXT NOT NULL,
        phone TEXT NOT NULL
      );
    `);
    await db.run(`UPDATE meta SET value = '8' WHERE key = 'db_version'`);
    console.log("Database updated to version 8: Added 'procedures' table.");
    currentVersion = 8;
  }

  if (currentVersion < 9) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS procedure_owners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        procedure_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        FOREIGN KEY (procedure_id) REFERENCES procedures(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customersaccount(id) ON DELETE CASCADE
      );
    `);
    await db.run(`UPDATE meta SET value = '9' WHERE key = 'db_version'`);
    console.log("Database updated to version 9: Added 'procedure_owners' table.");
    currentVersion = 9;
  }

  if (currentVersion < 10) {
    // ✅ Create the "tenants" table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contractStatus TEXT NOT NULL,
        startDate TEXT NOT NULL,
        propertyId INTEGER NOT NULL,
        endDate TEXT NOT NULL,
        entitlement REAL NOT NULL,
        contractNumber TEXT NOT NULL UNIQUE,
        installmentCount INTEGER NOT NULL,
        leasedUsage TEXT NOT NULL,
        propertyType TEXT NOT NULL,
        FOREIGN KEY (propertyId) REFERENCES realstates(id) ON DELETE CASCADE
      );
    `);
    await db.run(`UPDATE meta SET value = '10' WHERE key = 'db_version'`);
    console.log("Database updated to version 10: Added 'tenants' table.");
    currentVersion = 10;
  }

  if (currentVersion < 11) {
    // ✅ Create the "tenant_names" table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tenant_names (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL, -- Foreign key to tenants table
        customer_id INTEGER NOT NULL, -- Foreign key to customersaccount table
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customersaccount(id) ON DELETE CASCADE
      );
    `);
    await db.run(`UPDATE meta SET value = '11' WHERE key = 'db_version'`);
    console.log("Database updated to version 11: Added 'tenant_names' table.");
    currentVersion = 11;
  }

 
}

async function getDatabaseVersion(db: Database): Promise<number> {
  const row = await db.get(`SELECT value FROM meta WHERE key = 'db_version'`);
  return row ? Number(row.value) : 0;
}





//////////data base////////////////////////////////


// Register a new user
export async function registerUser(username: string, password: string): Promise<{ id: number; username: string }> {
  const db = await initializeDatabase();
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const result = await db.run('INSERT INTO users (username, password,role) VALUES (?, ?,?)', [username, hashedPassword,"admin"]);
  return { id: result.lastID!, username};
}

// Login a user
export async function loginUser(username: string, password: string): Promise<{ id: number; username: string }> {
  const db = await initializeDatabase();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

  if (!user) {
    throw new Error('User not found');
  }
console.log('====================================');
console.log(user);
console.log('====================================');
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid password');
  }

  return { id: user.id, username: user.username };
}

// Delete a user
export async function deleteUser(userId: number): Promise<{ deleted: boolean }> {
  const db = await initializeDatabase();
  const result = await db.run('DELETE FROM users WHERE id = ?', [userId]);
  return { deleted: result.changes! > 0 };
}