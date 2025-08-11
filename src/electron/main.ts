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

declare global {
  var updateProgressWindow: Electron.BrowserWindow | null;
}
global.updateProgressWindow = null;

app.on("ready", () => {
  const mainWindow = createMainWindow();

  // Register the event handler FIRST
  getAutoUpdater().on('checking-for-update', () => {
   
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
 
})
getAutoUpdater().on('error', (err) => {
 
})

getAutoUpdater().on('download-progress', (progressObj) => {
  // Only create one window for progress
  if (!global.updateProgressWindow || global.updateProgressWindow.isDestroyed()) {
    global.updateProgressWindow = new BrowserWindow({
      width: 420,
      height: 160,
      title: "Downloading Update",
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
  }

  const percent = Math.round(progressObj.percent);
  const speed = (progressObj.bytesPerSecond / 1024 / 1024).toFixed(2); // MB/s

  global.updateProgressWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <body style="font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#f8f9fa;">
      <h2 style="margin-bottom:16px;">Downloading Update...</h2>
      <div style="width:80%;height:24px;background:#e0e0e0;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="width:${percent}%;height:100%;background:#0078d4;transition:width 0.3s;"></div>
      </div>
      <div style="margin-top:12px;font-size:15px;color:#333;">
        ${percent}% &mdash; ${speed} MB/s
      </div>
      <div style="margin-top:4px;font-size:13px;color:#888;">
        ${progressObj.transferred} / ${progressObj.total} bytes
      </div>
    </body>
  `));
})
getAutoUpdater().on('update-downloaded', (info) => {
    
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