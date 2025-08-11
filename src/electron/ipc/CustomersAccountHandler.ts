import { ipcMain, BrowserWindow } from "electron";
import { addCustomersAccount, deleteCustomersAccount, getAllCustomersAccounts, getCustomersAccountById, updateCustomersAccount } from "../database/managedb/customersAccountOperations.js";

export function registerCustomersAccountIpcHandlers(mainWindow: BrowserWindow): void {
  // Add a new customer account
  ipcMain.handle("add-customers-account", async (_event, accountData) => {
    const account = await addCustomersAccount(
      accountData.name,
      accountData.accountNumber,
      accountData.accountType,
      accountData.phone,
      accountData.address,
      accountData.details,
    );
    mainWindow.webContents.send("customers-account-added", account);
    return account;
  });

  // Get all customer accounts
  ipcMain.handle("get-all-customers-accounts", async () => {
    return await getAllCustomersAccounts();
  });

  // Get a customer account by ID
  ipcMain.handle("get-customers-account-by-id", async (_event, accountId: number) => {
    return await getCustomersAccountById(accountId);
  });

  // Delete a customer account
  ipcMain.handle("delete-customers-account", async (_event, accountId: number) => {
    const result = await deleteCustomersAccount(accountId);
    if (result.deleted) {
      mainWindow.webContents.send("customers-account-deleted", accountId);
    }
    return result;
  });

  // Update a customer account
  ipcMain.handle("update-customers-account", async (_event, id: number, field: string, value: string | number) => {
    try {
      const result = await updateCustomersAccount(id, field, value);
      return result; // Returns { updated: boolean }
    } catch (error) {
      console.error("❌ Failed to update customers account:", error);
      throw error; // Ensure the frontend gets an error response
    }
  });
}