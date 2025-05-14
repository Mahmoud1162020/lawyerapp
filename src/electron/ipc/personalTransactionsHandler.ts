import { ipcMain, BrowserWindow } from "electron";
import {
  addPersonalTransaction,
  getAllPersonalTransactions,
  getPersonalTransactionsByUser,
  deletePersonalTransaction,
  searchPersonalTransactions,
  updatePersonalTransaction,
  getPersonalTransactionsByDateRange,
} from "../database/personalTransactionsOperations.js";

export function registerPersonalTransactionIpcHandlers(mainWindow: BrowserWindow): void {
  // Add a new personal transaction
  ipcMain.handle("add-personal-transaction", async (_event, transactionData) => {
    try {
      const transaction = await addPersonalTransaction(
        transactionData.userId,
        transactionData.recipient_id,
        transactionData.amount,
        transactionData.report,
        transactionData.transactionType,
        transactionData.date
      );
      mainWindow.webContents.send("personal-transaction-added", transaction);
      return transaction;
    } catch (error) {
      console.error("❌ Failed to add personal transaction:", error);
      throw error;
    }
  });

  // Get all personal transactions
  ipcMain.handle("get-all-personal-transactions", async () => {
    return await getAllPersonalTransactions();
  });

  // Get personal transactions by user ID
  ipcMain.handle("get-personal-transactions-by-user", async (_event, userId: number) => {
    return await getPersonalTransactionsByUser(userId);
  });

  // Delete a personal transaction
  ipcMain.handle("delete-personal-transaction", async (_event, transactionId: number) => {
    try {
      const result = await deletePersonalTransaction(transactionId);
      if (result.deleted) {
        mainWindow.webContents.send("personal-transaction-deleted", transactionId);
      }
      return result;
    } catch (error) {
      console.error("❌ Failed to delete personal transaction:", error);
      throw error;
    }
  });

  // Search personal transactions
  ipcMain.handle("search-personal-transactions", async (_event, query: string) => {
    return await searchPersonalTransactions(query);
  });

  // Update a personal transaction
  ipcMain.handle("update-personal-transaction", async (_event, id: number, field: string, value: string | number) => {
    try {
      const result = await updatePersonalTransaction(id, field, value);
      return result; // Returns { updated: boolean }
    } catch (error) {
      console.error("❌ Failed to update personal transaction:", error);
      throw error;
    }
  });

  // Get personal transactions by date range
  ipcMain.handle("get-personal-transactions-by-date-range", async (_event, startDate: string, endDate: string) => {
    return await getPersonalTransactionsByDateRange(startDate, endDate);
  });
}