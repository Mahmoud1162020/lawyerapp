import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import { getPreloadPath } from "../pathResolver.js";
import { isDev } from "../util.js";
import contextMenu from 'electron-context-menu';




export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
    width: 800,
    height: 600,
  });
contextMenu({
  window: mainWindow, 
  showSearchWithGoogle: true,
  
  showCopyLink: true,
  showSelectAll: true,
})

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    // mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist-react', 'index.html'));
// mainWindow.loadFile(path.resolve(app.getAppPath(), 'dist-react', 'index.html'));
console.log("Loading file:", path.resolve(app.getAppPath(), 'dist-react', 'index.html'));

  }

  mainWindow.on("close", (e) => {
    e.preventDefault();

    const response = dialog.showMessageBoxSync(mainWindow, {
      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 1,
      title: "Confirm Exit",
      message: "Are you sure you want to exit the app?",
    });

    if (response === 0) {
      mainWindow.destroy();
    }
  });
ipcMain.on("error",(error)=>{
  // console.log("❌ Error:");
  mainWindow.webContents.send("sql-error",error);
  
})
  return mainWindow;
}
