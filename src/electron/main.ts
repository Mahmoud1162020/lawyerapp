import { app, BrowserWindow } from "electron";
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
import log from 'electron-log';
import { getAutoUpdater } from "./autoUpdater.js";

app.on("ready", () => {
  const mainWindow = createMainWindow();

  // Register the event handler FIRST
  getAutoUpdater().on('checking-for-update', () => {
    console.log('Checking for update...');
    const updateWindow = new BrowserWindow({
      width: 400,
      height: 200,
      title: "Checking for Updates",
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    updateWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <h2>Checking for updates...</h2>
      </body>
    `));

    setTimeout(() => {
      if (!updateWindow.isDestroyed()) updateWindow.close();
    }, 3000);
  });
  getAutoUpdater().on('update-available', (info) => {
  const updateWindow = new BrowserWindow({
      width: 400,
      height: 200,
      title: "Checking for Updates",
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    updateWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <h2>Checking for updates..${info}.</h2>
      </body>
    `));
})
getAutoUpdater().on('update-not-available', (info) => {
  const updateWindow = new BrowserWindow({
      width: 400,
      height: 200,
      title: "Checking for Updates",
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    updateWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <h2update-not-available...</h2>
      </body>
    `));
})
getAutoUpdater().on('error', (err) => {
  const updateWindow = new BrowserWindow({
      width: 400,
      height: 200,
      title: "Checking for Updates",
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    updateWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <h2>update-error...${err}</h2>
      </body>
    `));
})

getAutoUpdater().on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  
    const updateWindow = new BrowserWindow({
      width: 400,
      height: 200,
      title: "Checking for Updates",
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
      updateWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <h2>update-error...${log_message}</h2>
      </body>
    `));
})
getAutoUpdater().on('update-downloaded', (info) => {
    const updateWindow = new BrowserWindow({
      width: 400,
      height: 200,
      title: "Checking for Updates",
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
      updateWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <h2>Update Downloaded ${info}</h2>
      </body>
    `));
});

  // THEN call checkForUpdates
  getAutoUpdater().logger = log;
  log.info('App starting...');
  getAutoUpdater().checkForUpdates();

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