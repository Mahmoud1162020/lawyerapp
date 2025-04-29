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
    // ✅ Create the "users" table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
    await db.run(`INSERT INTO meta (key, value) VALUES ('db_version', '1') ON CONFLICT(key) DO UPDATE SET value='1'`);
    currentVersion = 1;
  }

  if (currentVersion < 2) {
    // ✅ Add the "role" column to users
    await db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';`);
    await db.run(`UPDATE meta SET value = '2' WHERE key = 'db_version'`);
    console.log("Database updated to version 2: Added 'role' column.");
    currentVersion = 2;
  }

  if (currentVersion < 3) {
    // ✅ Create the "transactions" table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        recipient TEXT NOT NULL,
        amount REAL NOT NULL,
        report TEXT,
        transactionId TEXT UNIQUE NOT NULL,
        date TEXT DEFAULT (datetime('now', 'localtime')), 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    await db.run(`UPDATE meta SET value = '3' WHERE key = 'db_version'`);
    console.log("Database updated to version 3: Added 'transactions' table.");
    currentVersion = 3;
  }

  if (currentVersion < 4) {
    // ✅ Create the "customersaccount" table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS customersaccount (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        accountNumber TEXT NOT NULL,
        accountType TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        date TEXT DEFAULT (datetime('now', 'localtime')),
        details TEXT
      );
    `);
    await db.run(`UPDATE meta SET value = '4' WHERE key = 'db_version'`);
    console.log("Database updated to version 4: Added 'customersaccount' table.");
    currentVersion = 4;
  }
  if (currentVersion < 5) {
    // ✅ Add the "details" column to customersaccount
    await db.exec(`ALTER TABLE customersaccount ADD COLUMN name TEXT`);
    await db.run(`UPDATE meta SET value = '5' WHERE key = 'db_version'`);
    console.log("Database updated to version 5: Added 'name' column to customersaccount.");
    currentVersion = 5;
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