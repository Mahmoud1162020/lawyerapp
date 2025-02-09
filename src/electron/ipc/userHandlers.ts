import { ipcMain, BrowserWindow } from "electron";
import { registerUser, loginUser, deleteUser } from "../database/userOperations.js";
import Store from "electron-store";
const store = new Store();



interface UserStatus {
  isLoggedIn: boolean;
  username?: string;
}

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  let userStatus: UserStatus = { isLoggedIn: false };

  ipcMain.handle("register", async (_event, { username, password }: { username: string; password: string }) => {
    const user = await registerUser(username, password);
    userStatus = { isLoggedIn: true, username: user.username };
    mainWindow.webContents.send("user-status-update", userStatus);
    return user;
  });

  ipcMain.handle("set-user", async(_, user?:User) => {
  
    store.set("user", user); // Store user persistently
  });
  ipcMain.handle("get-user", async() => {
   
    const user: User = store.get("user") as User;
    console.log('==============user======================');
    console.log(user);
    console.log('====================================');
    if(user){
      userStatus = { isLoggedIn: true, username: user.username };
      mainWindow.webContents.send("user-status-update", userStatus);

    }
   
    
    return await store.get("user");
  });

  ipcMain.handle("login", async (_event, { username, password }: { username: string; password: string }) => {
    const user = await loginUser(username, password);
    userStatus = { isLoggedIn: true, username: user.username };
    mainWindow.webContents.send("user-status-update", userStatus);
    
    return user;
  });

  ipcMain.handle("logout", async () => {
    userStatus = { isLoggedIn: false };
    store.set("user", null);
    mainWindow.webContents.send("user-status-update", userStatus);
  });

  ipcMain.handle("delete-user", async (_event, userId: number) => {
    const result = await deleteUser(userId);
    if (result.deleted) {
      userStatus = { isLoggedIn: false };
      mainWindow.webContents.send("user-status-update", userStatus);
    }
    return result;
  });
}
