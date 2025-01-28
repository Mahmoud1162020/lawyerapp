import { app, BrowserWindow, dialog } from "electron";
import path from "path";
import { getPreloadPath } from "../pathResolver.js";
import { isDev } from "../util.js";


export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
    width: 800,
    height: 600,
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
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

  return mainWindow;
}
