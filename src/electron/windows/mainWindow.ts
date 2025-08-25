import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import { getPreloadPath } from "../pathResolver.js";
import { isDev } from "../util.js";
import contextMenu from 'electron-context-menu';
import { Menu } from "electron"; // <-- added

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
  });

  // Application menu
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [{ role: "quit" }],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
       
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            const { shell } = await import("electron");
            shell.openExternal("https://your-docs-or-help-url");
          },
        },
      ],
    },
  ];

  // macOS: add App menu
  if (process.platform === "darwin") {
    template.unshift({
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" }, // <-- fixed casing
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist-react', 'index.html'));
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
    mainWindow.webContents.send("sql-error",error);
  });

  return mainWindow;
}
