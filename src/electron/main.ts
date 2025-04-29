import { app } from "electron";
import { createMainWindow } from "./windows/mainWindow.js";
import { registerIpcHandlers } from "./ipc/userHandlers.js";
import { registerTransactionIpcHandlers } from "./ipc/TransactionsHandler.js";
import { registerCustomersAccountIpcHandlers } from "./ipc/CustomersAccountHandler.js";

app.on("ready", () => {
  const mainWindow = createMainWindow();
  registerIpcHandlers(mainWindow);
  registerTransactionIpcHandlers(mainWindow);
  registerCustomersAccountIpcHandlers(mainWindow);
});






// import { app, BrowserWindow, ipcMain ,dialog } from "electron";
// import path from "path";
// import { ipcMainHandle, isDev } from "./util.js";
// import { getPreloadPath } from "./pathResolver.js";
// import { getStaticData, pollResources } from "./resourcesManager.js";
// import { deleteUser, loginUser, registerUser } from "./database.js";

// app.on("ready", () => {
//   const mainWindow = new BrowserWindow({
//     webPreferences:{
//       preload:getPreloadPath()
//     },
//     width: 800,
//     height: 600,
//   });
//   if(isDev()){
//    mainWindow.loadURL('http://localhost:5123')
//   }else{

//     mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
//   }

//   let userStatus: UserStatus = { isLoggedIn: false };



//   ipcMain.handle('register', async (event, { username, password }: { username: string; password: string }) => {
//     const user = await registerUser(username, password);
//     userStatus = { isLoggedIn: true, username: user.username }; // Update user status
//     mainWindow.webContents.send('user-status-update', userStatus); // Send status to React
//     return user;
//   });

//   ipcMain.handle('login', async (event, { username, password }: { username: string; password: string }) => {
//     const user = await loginUser(username, password);
//     userStatus = { isLoggedIn: true, username: user.username }; // Update user status
//     mainWindow.webContents.send('user-status-update', userStatus); // Send status to React
//     return user;
//   });
//   ipcMain.handle('logout', async () => {
//     userStatus = { isLoggedIn: false }; // Update user status
//     mainWindow.webContents.send('user-status-update', userStatus); // Send status to React
//   });
//   ipcMain.handle('delete-user', async (event, userId: number) => {
//     const result = await deleteUser(userId);
//     if (result.deleted) {
//       userStatus = { isLoggedIn: false }; // Update user status
//       mainWindow.webContents.send('user-status-update', userStatus); // Send status to React
//     }
//     return result;
//   });

//   mainWindow.on('close', (e) => {
//     e.preventDefault(); // Prevent the window from closing immediately

//     // Show confirmation dialog
//     const response = dialog.showMessageBoxSync(mainWindow, {
//       type: 'question',
//       buttons: ['Yes', 'No'],
//       defaultId: 1, // Index of the default selected button ('No')
//       title: 'Confirm Exit',
//       message: 'Are you sure you want to exit the app?',
//     });

//     if (response === 0) {
//       // If "Yes" is clicked, destroy the window
//       mainWindow.destroy();
//     }
//     // If "No" is clicked, do nothing (window remains open)
//   });


// });
