import { initializeDatabase } from "../userOperations.js";
import fs from 'fs/promises';

export async function addAttachment(realstateId: number | null, filePath: string): Promise<{ id: number }> {
  const db = await initializeDatabase();
  const result = await db.run(`INSERT INTO attachments (realstate_id, path) VALUES (?, ?)`, [realstateId, filePath]);
  return { id: result.lastID! };
}

export async function getAttachmentsForRealState(realstateId: number) {
  const db = await initializeDatabase();
  return db.all(`SELECT * FROM attachments WHERE realstate_id = ? ORDER BY created_at DESC`, [realstateId]);
}

export async function deleteAttachment(attachmentId: number): Promise<{ deleted: boolean }> {
  const db = await initializeDatabase();
  const row = await db.get(`SELECT path FROM attachments WHERE id = ?`, [attachmentId]);
  if (!row) return { deleted: false };
  const filePath: string = row.path;
  try {
    // attempt to delete the file on disk; ignore errors if file missing
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (e) {
        // file might not exist; continue
        console.warn('Failed to unlink attachment file', filePath, e);
      }
    }
    await db.run(`DELETE FROM attachments WHERE id = ?`, [attachmentId]);
    return { deleted: true };
  } catch (err) {
    console.error('deleteAttachment error', err);
    return { deleted: false };
  }
}
