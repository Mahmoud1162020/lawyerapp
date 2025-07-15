import { ipcMain, BrowserWindow } from "electron";
import { registerUser, loginUser, deleteUser, updateUser, createActivationCode, getActivationCodes, updateUserPermissions } from "../database/userOperations.js";
import Store from "electron-store";
import { getAllUsers } from "../database/userOperations.js";
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
  // console.log('==============user======================');
  // console.log(user);
  // console.log('====================================');
  if(user){
    userStatus = { isLoggedIn: true, username: user.username };
    mainWindow.webContents.send("user-status-update", userStatus);
  }
  return user;
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

ipcMain.handle("get-all-users", async () => {
  const users = await getAllUsers();
  return users;
});


ipcMain.handle(
  "update-user",
  async (_event, userId: number, updates: { username?: string; password?: string; role?: string; debit?: number; credit?: number }) => {
    
    const result = await updateUser(userId, updates);
    return result;
  }
);


ipcMain.handle("create-activation-code", async (_event, code: string, duration: number,status:string, activatedBy?: number,) => {
  const result=await createActivationCode(code, duration, activatedBy,status);
  return result;
});

ipcMain.handle("get-activation-codes", async () => {
  const activationCodes = getActivationCodes();
  return activationCodes;
});


ipcMain.handle(
  "update-user-permissions",
  async (_event, userId: number, permissions: Record<string, boolean>) => {
    const result = await updateUserPermissions(userId, permissions);
    return result;
  }
);