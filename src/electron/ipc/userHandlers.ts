import { ipcMain, BrowserWindow, app } from "electron";
import fs from "fs/promises";
import path from "path";
import { shell } from 'electron';
import { registerUser, loginUser, deleteUser, updateUser, createActivationCode, getActivationCodes, updateUserPermissions } from "../database/userOperations.js";
import { restoreBackup, BackupObject } from "../database/restoreOperations.js";
import Store from "electron-store";
import { getAllUsers } from "../database/userOperations.js";
import { addAttachment, getAttachmentsForEntity } from '../database/managedb/attachmentsOperations.js';
import { deleteAttachment } from '../database/managedb/attachmentsOperations.js';
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

// Save a binary file (image/pdf/...) into userData/attachments (or subfolder) and return saved path
ipcMain.handle("save-file", async (_event, filename: string, buffer: ArrayBuffer | Buffer, subfolder?: string) => {
  try {
    const userData = app.getPath("userData");
    const dir = path.join(userData, subfolder || "attachments");
    await fs.mkdir(dir, { recursive: true });
    const uniqueName = `${Date.now()}-${filename}`;
    const savePath = path.join(dir, uniqueName);
    const data = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as ArrayBuffer);
    await fs.writeFile(savePath, data);
    return { path: savePath };
  } catch (err) {
    console.error("Failed to save file:", err);
    throw err;
  }
});

// Add attachment record (link a saved path to a realstate)
ipcMain.handle('add-attachment', async (_event, entityType: string, entityId: number | null, filePath: string) => {
  try {
    const res = await addAttachment(entityType, entityId, filePath);
    return res;
  } catch (err) {
    console.error('Failed to add attachment record', err);
    throw err;
  }
});

// Fetch attachments for a given realstate id
ipcMain.handle('get-attachments', async (_event, entityType: string, entityId: number) => {
  try {
    const rows = await getAttachmentsForEntity(entityType, entityId);
    return rows;
  } catch (err) {
    console.error('Failed to fetch attachments', err);
    throw err;
  }
});

// Delete attachment by id (removes DB row and attempts to delete file)
ipcMain.handle('delete-attachment', async (_event, attachmentId: number) => {
  try {
    const res = await deleteAttachment(attachmentId);
    return res;
  } catch (err) {
    console.error('Failed to delete attachment', err);
    throw err;
  }
});

// Open a saved file using the OS default application
ipcMain.handle('open-file', async (_event, filePath: string) => {
  try {
    const result = await shell.openPath(filePath);
    return { success: result === '' , message: result };
  } catch (err) {
    console.error('open-file error', err);
    return { success: false, message: String(err) };
  }
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

// Restore backup (expects parsed backup object)
ipcMain.handle("restore-backup", async (_event, backupObj: BackupObject) => {
  const result = await restoreBackup(backupObj);
  return result;
});