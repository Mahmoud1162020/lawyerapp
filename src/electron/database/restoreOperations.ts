import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { Database } from 'sqlite';
import { initializeDatabase } from './userOperations.js';

export type BackupObject = Record<string, any>;

// Map keys used in the export ZIP to real table names
const TABLE_MAP: Record<string, string> = {
  users: 'users',
  transactions: 'transactions',
  personalTransactions: 'personaltransactions',
  realstates: 'realstates',
  procedures: 'procedures',
  tenants: 'tenants',
  tenantTransactions: 'tenantsTransactions',
  customers: 'customersaccount',
  internalTransactions: 'internalTransactions',
};

async function insertRows(db: Database, tableName: string, rows: any[]) {
  if (!Array.isArray(rows) || rows.length === 0) return { inserted: 0, warnings: [] };

  // Get table schema to know which columns exist and which are NOT NULL
  const tableInfo: any[] = await db.all(`PRAGMA table_info(${tableName})`);
  const schemaCols = tableInfo.map((c) => c.name);
  const requiredCols = tableInfo.filter((c) => c.notnull === 1).map((c) => c.name);

  let inserted = 0;
  const warnings: string[] = [];

  for (const row of rows) {
    // Only keep keys that exist in the table
    const rowKeys = Object.keys(row || {}).filter((k) => schemaCols.includes(k));

    // Check required columns are present and non-null (except id auto-handled)
    const missingRequired = requiredCols.filter((col) => col !== 'id' && (row[col] === undefined || row[col] === null));
    if (missingRequired.length > 0) {
      warnings.push(`Table ${tableName}: skipped row because missing required columns: ${missingRequired.join(', ')}`);
      continue; // skip this row
    }

    if (rowKeys.length === 0) {
      warnings.push(`Table ${tableName}: skipped empty row`);
      continue;
    }

    const columns = rowKeys;
    const placeholders = columns.map(() => '?').join(', ');
    const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    const values = columns.map((c) => (row[c] === undefined ? null : row[c]));

    try {
      await db.run(insertSql, values);
      inserted++;
    } catch (err: any) {
      warnings.push(`Table ${tableName}: failed to insert row (${err?.message || String(err)})`);
    }
  }

  // Update sqlite_sequence for AUTOINCREMENT tables if `id` column exists
  if (schemaCols.includes('id')) {
    const maxRow: any = await db.get(`SELECT MAX(id) as m FROM ${tableName}`);
    const max = maxRow?.m ?? 0;
    try {
      await db.run(`UPDATE sqlite_sequence SET seq = ? WHERE name = ?`, [max, tableName]);
    } catch (e) {
      // sqlite_sequence may not exist for this table; ignore
    }
  }

  return { inserted, warnings };
}

export async function restoreBackup(backup: BackupObject): Promise<{ restored: boolean; message?: string; summary?: Record<string, number>; warnings?: string[] }> {
  // Validate basic structure
  if (!backup || typeof backup !== 'object' || !backup.metadata) {
    throw new Error('Invalid backup object');
  }

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'appdatabase.sqlite');
  const copyPath = path.join(userDataPath, `appdatabase-backup-before-restore-${Date.now()}.sqlite`);

  // Create a file-system copy of the current DB so we can restore on error
  try {
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, copyPath);
    }
  } catch (err) {
    console.error('Failed to create DB backup copy:', err);
    throw new Error('Failed to create DB backup copy: ' + String(err));
  }

  let db: Database | null = null;
  try {
    db = await initializeDatabase();

    // Disable foreign keys to allow bulk replace
    await db.exec('PRAGMA foreign_keys = OFF;');
    await db.exec('BEGIN TRANSACTION;');

    // For each supported table, delete existing rows then insert from backup
    const allWarnings: string[] = [];
    const summary: Record<string, number> = {};
    for (const key of Object.keys(TABLE_MAP)) {
      const tableName = TABLE_MAP[key];
      const rows = backup[key];
      if (!rows) continue;

      // Clear existing data
      await db.run(`DELETE FROM ${tableName};`);

      // Insert rows (if any)
      if (Array.isArray(rows) && rows.length > 0) {
        const result = await insertRows(db, tableName, rows as Record<string, unknown>[]);
        summary[tableName] = result.inserted ?? 0;
        if (Array.isArray(result.warnings) && result.warnings.length > 0) {
          allWarnings.push(...result.warnings);
        }
      } else {
        summary[tableName] = 0;
      }
    }

    await db.exec('COMMIT;');
    await db.exec('PRAGMA foreign_keys = ON;');

    const message = 'تم استعادة النسخة الاحتياطية بنجاح';
    const result: { restored: boolean; message?: string; summary?: Record<string, number>; warnings?: string[] } = {
      restored: true,
      message,
      summary,
      warnings: allWarnings,
    };
    return result;
  } catch (err: any) {
    console.error('Restore failed, attempting to rollback and restore DB copy:', err);
    try {
      if (db) {
        await db.exec('ROLLBACK;');
      }
    } catch (e) {
      console.error('Rollback failed:', e);
    }

    // Try to restore the original DB file from the copy we made
    try {
      if (fs.existsSync(copyPath)) {
        fs.copyFileSync(copyPath, dbPath);
      }
    } catch (e) {
      console.error('Failed to restore DB file from copy:', e);
    }

    throw err;
  }
}

export default restoreBackup;
