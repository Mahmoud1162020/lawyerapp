const electron = require('electron');

electron.contextBridge.exposeInMainWorld('electron', {
  subscribeStatistics: (callback) =>
    
    ipcOn('statistics', (stats) => {
      callback(stats);
    }),
  subscribeChangeView: (callback) =>
    ipcOn('changeView', (view) => {
      callback(view);
    }),
  getStaticData: () => ipcInvoke('getStaticData'),
  sendFrameAction: (payload) => ipcSend('sendFrameAction', payload),
  sendExit: () => electron.ipcRenderer.send('exit'),
  register: (username: string, password: string) => electron.ipcRenderer.invoke('register', { username, password }),
  login: (username: string, password: string) => electron.ipcRenderer.invoke('login', { username, password }),
  logout: () => electron.ipcRenderer.invoke('logout'),
  deleteUser: (userId: number) => electron.ipcRenderer.invoke('delete-user', userId),
  onUserStatusUpdate: (callback: (status: UserStatus) => void) => {
    electron.ipcRenderer.on('user-status-update', (event, status) => callback(status));
  },

} satisfies Window['electron']);

function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key
): Promise<EventPayloadMapping[Key]> {
  return electron.ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void
) {
  const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
  electron.ipcRenderer.on(key, cb);
  return () => electron.ipcRenderer.off(key, cb);
}  

function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload: EventPayloadMapping[Key]
) {
  electron.ipcRenderer.send(key, payload);
}