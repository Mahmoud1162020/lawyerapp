import { ipcMain, BrowserWindow } from "electron";
import { addError } from "../database/managedb/ErrorHandlerOperations.js";

export function registerErrorIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle("error", async (_event, data) => {
   const error=await addError(data)
   console.log("Error logged:========", error);
   

    // Forward the error to the frontend
    mainWindow.webContents.send("error", error);
  });
}

