import { ipcMain, BrowserWindow } from "electron";
import {
  addTransaction,
  getAllTransactions,
  getTransactionsByUser,
  deleteTransaction,
  searchTransactions,
  updateTransaction,
} from "../database/transactionsOperations.js";

export function registerTransactionIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle("add-transaction", async (_event, transactionData) => {
    const transaction = await addTransaction(
      transactionData.user_id,
      transactionData.recipient,
      transactionData.amount,
      transactionData.report,
      transactionData.transactionId
    );
    mainWindow.webContents.send("transaction-added", transaction);
    return transaction;
  });

  ipcMain.handle("get-all-transactions", async () => {
    return await getAllTransactions();
  });

  ipcMain.handle("get-transactions-by-user", async (_event, userId: number) => {
    return await getTransactionsByUser(userId);
  });

  ipcMain.handle("delete-transaction", async (_event, transactionId: number) => {
    const result = await deleteTransaction(transactionId);
    if (result.deleted) {
      mainWindow.webContents.send("transaction-deleted", transactionId);
    }
    return result;
  });

  ipcMain.handle("search-transactions", async (_event, query: string) => {
    return await searchTransactions(query);
  });

  ipcMain.handle("update-transaction", async (_event, id: number, field: string, value: string | number) => {
    try {
      const result = await updateTransaction(id, field, value);
      return result; // Returns { updated: boolean }
    } catch (error) {
      console.error("❌ Failed to update transaction:", error);
      throw error; // Ensure the frontend gets an error response
    }
  });
  
}
