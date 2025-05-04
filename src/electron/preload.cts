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
  getUser: () => electron.ipcRenderer.invoke('get-user'),
  setUser: (user: User) => electron.ipcRenderer.invoke('set-user', user),
  deleteUser: (userId: number) => electron.ipcRenderer.invoke('delete-user', userId),
  onUserStatusUpdate: (callback: (status: UserStatus) => void) => {
    electron.ipcRenderer.on('user-status-update', (event, status) => callback(status));
  },
  addTransaction: (
    user_id: number,
    recipient: string,
    amount: number,
    report: string,
    transactionId: string
  ): Promise<{ id: number }> => electron.ipcRenderer.invoke('add-transaction', { user_id, recipient, amount, report, transactionId }),
  getTransactionsByUser:(userId:number)=> electron.ipcRenderer.invoke("get-transactions-by-user",userId),
  updateTransaction: (id: number, field: string, value: string | number) =>electron.ipcRenderer.invoke("update-transaction", id, field, value),
  deleteTransaction:(transactionId: number)=>electron.ipcRenderer.invoke("delete-transaction",transactionId),
  addCustomersAccount:(
    name: string,
    accountNumber: string,
    accountType: string,
    phone: string,
    address: string,
    details: string
  ): Promise<{ id: number }> => electron.ipcRenderer.invoke('add-customers-account', {name, accountNumber, accountType, phone, address, details }),
  getAllCustomersAccounts:():Promise<{ id: number; name : string;accountNumber: string; accountType: string; phone: string; address: string; date: string; details: string | null }[]>=>electron.ipcRenderer.invoke("get-all-customers-accounts"),
  getCustomersAccountById: (id: number): Promise<{ id: number;name:string; accountNumber: string; accountType: string; phone: string; address: string; date: string; details: string | null } | null> => electron.ipcRenderer.invoke('get-customers-account-by-id', id),
  deleteCustomersAccount: (id: number): Promise<{ deleted: boolean }> => electron.ipcRenderer.invoke('delete-customers-account', id),
  updateCustomersAccount: (id: number, field: string, value: string | number): Promise<{ updated: boolean }> => electron.ipcRenderer.invoke('update-customers-account', id, field, value),
  addRealState: (
    propertyTitle: string,
    propertyNumber: string,
    address: string,
    price: number,
    details: string,
    owners: number[]
  ): Promise<{ id: number }> => electron.ipcRenderer.invoke('add-real-state', {propertyTitle, propertyNumber, address, price, details, owners }),
  getAllRealStates: (): Promise<{ id: number; propertyTitle: string; propertyNumber: string; address: string; price: number; date: string; details: string | null; owners: { id: number; name: string }[] }[]> => electron.ipcRenderer.invoke('get-all-real-states'),
  getRealStateById: (id: number): Promise<{ id: number; propertyTitle: string; propertyNumber: string; address: string; price: number; date: string; details: string | null; owners: { id: number; name: string }[] } | null> => electron.ipcRenderer.invoke('get-real-state-by-id', id),
  deleteRealState: (id: number): Promise<{ deleted: boolean }> => electron.ipcRenderer.invoke('delete-real-state', id),
  updateRealState: (id: number, field: string, value: string | number): Promise<{ updated: boolean }> => electron.ipcRenderer.invoke('update-real-state', id, field, value),
  updateRealStateOwners: (realStateId: number, owners: number[]): Promise<{ updated: boolean }> => electron.ipcRenderer.invoke('update-real-state-owners', realStateId, owners),
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