import { ipcMain, BrowserWindow } from "electron";
import { addTenantTransaction, deleteTenantTransaction, getAllTenantTsransactions, getTenantTransactions, getTenatnTransactionById, updateTenantTransaction } from "../database/managedb/tenantsTransactionsOperations.js";


export function registerTenantsTransactionsIpcHandlers(mainWindow: BrowserWindow): void {
  // Add a tenant transaction
  ipcMain.handle("add-tenant-transaction", async (_event, tenantId: number, propertyId: number, customerId: number, transaction: { amount: number; date: string; isPaid: boolean }) => {
    console.log("Adding tenant transaction:", { tenantId, propertyId, customerId, transaction });

    const result = await addTenantTransaction(tenantId, propertyId, customerId, transaction);
    mainWindow.webContents.send("tenant-transaction-added", { tenantId, propertyId, customerId, transaction });
    return result;
  });

  // Get all transactions for a tenant
  ipcMain.handle("get-tenant-transactions", async (_event, tenantId: number) => {
    console.log("Fetching transactions for tenant ID:", tenantId);

    const transactions = await getTenantTransactions(tenantId);
    return transactions;
  });

  ipcMain.handle("get-all-tenants-transactions", async () => {
    console.log("Fetching transactions for tenant ID:",);

    const transactions = await getAllTenantTsransactions();
    return transactions;
  });


  // Update a tenant transaction
  ipcMain.handle("update-tenant-transaction", async (_event,  transactionId: number, updatedTransaction: { amount: number; date: string; isPaid: boolean }) => {
    console.log("Updating tenant transaction:", {  transactionId, updatedTransaction });

    const result = await updateTenantTransaction(transactionId, updatedTransaction);
    mainWindow.webContents.send("tenant-transaction-updated", {transactionId, updatedTransaction });
    return result;
  });

  // Delete a tenant transaction
  ipcMain.handle("delete-tenant-transaction", async (_event, transactionId: number) => {
    console.log("Deleting tenant transaction:", {  transactionId });

    const result = await deleteTenantTransaction(transactionId);
    mainWindow.webContents.send("tenant-transaction-deleted", {transactionId });
    return result;
  });
}

ipcMain.handle("get-tenant-transaction-details", async (_event, transactionId: number) => {
console.log("Fetching tenant transaction details for ID:", transactionId);
  const transactionDetails = await getTenatnTransactionById(transactionId);
  if (!transactionDetails) {
    throw new Error(`Transaction with ID ${transactionId} not found`);
  }
  return transactionDetails;

})
