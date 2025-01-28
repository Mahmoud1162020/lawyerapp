
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import bcrypt from 'bcrypt';
import { app } from 'electron';

const saltRounds = 10;

// Open the SQLite database
async function initializeDatabase(): Promise<Database> {
  const db = await open({
    filename: path.join(app.getAppPath(), 'database.sqlite'),
    driver: sqlite3.Database,
  });

  // Create the users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  return db;
}

// Register a new user
export async function registerUser(username: string, password: string): Promise<{ id: number; username: string }> {
  const db = await initializeDatabase();
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const result = await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
  return { id: result.lastID!, username };
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