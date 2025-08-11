import { ipcMain, BrowserWindow } from "electron";

export function registerErrorIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle("error", async (_event, errorMessage) => {
    console.log(mainWindow, errorMessage);
  });
}

