import { app, BrowserWindow  } from "electron";
import path from "path";
import { ipcMainHandle, isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { getStaticData, pollResources } from "./resourcesManager.js";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences:{
      preload:getPreloadPath()
    },
    width: 800,
    height: 600,
  });
  if(isDev()){
   mainWindow.loadURL('http://localhost:5123')
  }else{

    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  pollResources(mainWindow)
  ipcMainHandle('getStaticData', () => {
    return getStaticData();
  });

});
