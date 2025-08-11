import { ipcMain, BrowserWindow } from "electron";
import {
  addInternalTransaction,
  getAllInternalTransactions,
  getInternalTransactionById,
  updateInternalTransaction,
  deleteInternalTransaction,
} from "../database/managedb/internalTransactionsOperations.js";

export function registerInternalTransactionsIpcHandlers(mainWindow: BrowserWindow): void {
  // Add a new internal transaction
  ipcMain.handle("add-internal-transaction", async (_event, tx: InternalTransaction) => {
    const id = await addInternalTransaction(tx);
    mainWindow.webContents.send("internal-transaction-added", id);
    return id;
  });

  // Get all internal transactions
  ipcMain.handle("get-all-internal-transactions", async () => {
    return await getAllInternalTransactions();
  });

  // Get a single internal transaction by ID
  ipcMain.handle("get-internal-transaction-by-id", async (_event, id: number) => {
    return await getInternalTransactionById(id);
  });

  // Update an internal transaction
  ipcMain.handle("update-internal-transaction", async (_event, id: number, tx: Partial<InternalTransaction>) => {
    await updateInternalTransaction(id, tx);
    mainWindow.webContents.send("internal-transaction-updated", id);
    return { success: true };
  });

  // Delete an internal transaction
  ipcMain.handle("delete-internal-transaction", async (_event, id: number) => {
    await deleteInternalTransaction(id);
    mainWindow.webContents.send("internal-transaction-deleted", id);
    return { success: true };
  });
}