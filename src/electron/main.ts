import { app } from "electron";
import { createMainWindow } from "./windows/mainWindow.js";
import { registerIpcHandlers } from "./ipc/userHandlers.js";
import { registerTransactionIpcHandlers } from "./ipc/TransactionsHandler.js";
import { registerCustomersAccountIpcHandlers } from "./ipc/CustomersAccountHandler.js";
import { registerRealStateIpcHandlers } from "./ipc/RealStateHandler.js";
import { registerProcedureIpcHandlers } from "./ipc/ProcedureHandler.js";
import { registerTenantsIpcHandlers } from "./ipc/TenantsHandler.js";
import { registerPersonalTransactionIpcHandlers } from "./ipc/personalTransactionsHandler.js";
import { registerTenantsTransactionsIpcHandlers } from "./ipc/TenantsTransactionsHandler.js";
import { registerInternalTransactionsIpcHandlers } from "./ipc/InternalTransactionsHandler.js";
import { updateExpiredTenancies } from "./database/managedb/tenantsOperations.js";
import { setupAutoUpdater } from "./autoUpdater.js";

app.on("ready", () => {
  const mainWindow = createMainWindow();
    setupAutoUpdater(mainWindow);

  registerIpcHandlers(mainWindow);
  registerTransactionIpcHandlers(mainWindow);
  registerPersonalTransactionIpcHandlers(mainWindow);
  registerCustomersAccountIpcHandlers(mainWindow);
  registerRealStateIpcHandlers(mainWindow);
  registerProcedureIpcHandlers(mainWindow);
  registerTenantsIpcHandlers(mainWindow);
  registerTenantsTransactionsIpcHandlers(mainWindow);
  registerInternalTransactionsIpcHandlers(mainWindow);
  setInterval(async () => {
    await updateExpiredTenancies();
  }, 1 * 60 * 60 * 1000); // every 24 hours
});