import pkg from "electron-updater";
const { autoUpdater } = pkg;
import { dialog } from "electron";

export function setupAutoUpdater(mainWindow: Electron.BrowserWindow) {
  console.log("Setting up auto updater...");
  
  autoUpdater.autoDownload = true;

  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for update...");
  });

  autoUpdater.on("update-available", () => {
    console.log("Update available!");
    mainWindow.webContents.send("update_available");
  });

  autoUpdater.on("update-not-available", () => {
    console.log("No update available.");
  });

  autoUpdater.on("error", (err) => {
    console.error("Update error:", err);
    mainWindow.webContents.send("update_error", err == null ? "Unknown error" : err.message);
  });

  autoUpdater.on("download-progress", (progressObj) => {
    console.log("Download progress:", progressObj);
  });

  autoUpdater.on("update-downloaded", () => {
    console.log("Update downloaded!");
    mainWindow.webContents.send("update_downloaded");
    dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Update Ready",
      message: "A new update is ready. Restart the app to apply the update.",
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Check for updates now (after handlers are set)
  autoUpdater.checkForUpdatesAndNotify();
}
