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
  onError: (callback: (error: string) => void) => {
    electron.ipcRenderer.on("sql-error", (_event, error) => {
      callback(error); // Pass the error message to the callback
    });
  },
  offError: (callback: (error: string) => void) => {
    const wrappedCallback = (callback as any)._wrappedCallback;
    if (wrappedCallback) {
      electron.ipcRenderer.off("sql-error", wrappedCallback);
    }
  },
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
  // Transactions
  addTransaction: (
    userId: number,
    recipient: string,
    amount: number,
    report: string,
    procedureId: number,
    type: "procedure" | "personal",
    transactionType: "incoming" | "outgoing",
    date: string
  ): Promise<{ id: number }> => electron.ipcRenderer.invoke('add-transaction', { userId, recipient, amount, report, procedureId, type ,transactionType,date}),
  getAllTransactions: (): Promise<{ id: number; userId: number; recipient: string; amount: number; report: string; procedureId: number; type: "procedure" | "personal";transactionType: "incoming" | "outgoing"; date: string }[]> => electron.ipcRenderer.invoke("get-all-transactions"),
  getTransactionsByUser:(userId:number)=> electron.ipcRenderer.invoke("get-transactions-by-user",userId),
  updateTransaction: (id: number, field: string, value: string | number) =>electron.ipcRenderer.invoke("update-transaction", id, field, value),
  deleteTransaction:(transactionId: number)=>electron.ipcRenderer.invoke("delete-transaction",transactionId),
  getTransactionById:(id:number):Promise<Transaction>=>electron.ipcRenderer.invoke("get-transactions-by-id",id),
  // Customers
  addCustomersAccount:(
    name: string,
    accountNumber: string,
    accountType: string,
    phone: string,
    address: string,
    details: string
  ): Promise<{ id: number }> => electron.ipcRenderer.invoke('add-customers-account', {name, accountNumber, accountType, phone, address, details }),
  getAllCustomersAccounts: (): Promise<Customer[]> =>
    electron.ipcRenderer.invoke("get-all-customers-accounts").then((accounts: any[]) =>
      accounts.map(account => ({
        ...account,
        debit: account.debit ?? 0,
        credit: account.credit ?? 0
      }))
    ),
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
  addProcedure: (
    procedureNumber: string,
    procedureName: string,
    description: string,
    date: string,
    status: string,
    phone: string,
    owners: number[]
  ): Promise<{ id: number }> => electron.ipcRenderer.invoke('add-procedure', {procedureNumber,procedureName,description, date, status, phone, owners }),
  getAllProcedures: (): Promise<{ id: number; procedureNumber: string; procedureName: string; description: string; date: string; status: string; phone: string; owners: { id: number; name: string }[] }[]> => electron.ipcRenderer.invoke('get-all-procedures'),
  getProcedureById: (id: number): Promise<{ id: number; procedureNumber: string; procedureName: string; description: string; date: string; status: string; phone: string; owners: { id: number; name: string }[] } | null> => electron.ipcRenderer.invoke('get-procedure-by-id', id),
  deleteProcedure: (id: number): Promise<{ deleted: boolean }> => electron.ipcRenderer.invoke('delete-procedure', id),
  updateProcedure: (id: number, field: string, value: string | number): Promise<{ updated: boolean }> => electron.ipcRenderer.invoke('update-procedure', id, field, value),
  updateProcedureOwners: (procedureId: number, owners: number[]): Promise<{ updated: boolean }> => electron.ipcRenderer.invoke('update-procedure-owners', procedureId, owners),
  addTenant: (
    contractStatus: string,
    startDate: string,
    tenantIds: number[],
    propertyId: number,
    endDate: string,
    entitlement: number,
    contractNumber: string,
    installmentCount: number,
    leasedUsage: string,
    propertyType: string
  ): Promise<{ id: number }> => electron.ipcRenderer.invoke('add-tenant', {contractStatus, startDate, tenantIds, propertyId, endDate, entitlement, contractNumber, installmentCount, leasedUsage, propertyType }),
  getAllTenants: (): Promise<{ id: number; contractStatus: string; startDate: string; tenantNames: string[]; propertyNumber: number; endDate: string; entitlement: number; contractNumber: string; installmentCount: number; leasedUsage: string; propertyType: string,propertyDetails: {
    id: number,
    propertyTitle: string,
    propertyNumber: string,
    address: string,
    price: number,
    date: string
    details: string | null
  } }[]> => electron.ipcRenderer.invoke('get-all-tenants'),
  getTenantById: (tenantId: number): Promise<{ id: number; contractStatus: string; startDate: string; tenantNames: [{ id: number; name: string; }]; propertyNumber: number; endDate: string; entitlement: number; contractNumber: string; installmentCount: number; leasedUsage: string; propertyType: string } | null> => electron.ipcRenderer.invoke('get-tenant-by-id', tenantId),
  deleteTenant: (tenantId: number): Promise<{ deleted: boolean }> => electron.ipcRenderer.invoke('delete-tenant', tenantId),
  updateTenant: (id: number, field: string, value: string | number): Promise<{ updated: boolean }> => electron.ipcRenderer.invoke('update-tenant', id, field, value),
  updateTenantNames: (tenantId: number, tenantNames: string[]): Promise<{ updated: boolean }> => electron.ipcRenderer.invoke('update-tenant-names', tenantId, tenantNames),
  addPersonalTransaction: (
    userId: number,
    customer_id: number,
    amount: number,
    report: string,
    transactionType: "incoming" | "outgoing",
    date: string
  ): Promise<{ id: number }> => electron.ipcRenderer.invoke('add-personal-transaction', {userId, customer_id, amount, report,transactionType, date }),
  getAllPersonalTransactions: (): Promise<{ id: number; userId: number; customer_id: number; amount: number; report: string; date: string }[]> => electron.ipcRenderer.invoke('get-all-personal-transactions'),
  getPersonalTransactionById: (id: number): Promise<PersonalTransaction | null> => electron.ipcRenderer.invoke('get-personal-transaction-by-id', id),
  deletePersonalTransaction: (id: number): Promise<{ deleted: boolean }> => electron.ipcRenderer.invoke('delete-personal-transaction', id),
  updatePersonalTransaction: (id: number, field: string, value: string | number): Promise<{ updated: boolean }> => electron.ipcRenderer.invoke('update-personal-transaction', id, field, value),
  getPersonalTransactionsByDateRange: (startDate: string, endDate: string): Promise<{ id: number; userId: number; recipient: string; amount: number; report: string; date: string }[]> => electron.ipcRenderer.invoke('get-personal-transactions-by-date-range', startDate, endDate),
addTenantTransaction: (
  tenantId: number,
  propertyId: number,
  customerId: number,
  transaction: { amount: number; date: string; isPaid: boolean; description?: string,isCredit?: boolean }
): Promise<void> => electron.ipcRenderer.invoke('add-tenant-transaction', tenantId, propertyId, customerId, transaction),
getTenantTransactions: (tenantId: number): Promise<TenantTransaction[]> => electron.ipcRenderer.invoke('get-tenant-transactions', tenantId),
getAllTenantTransactions: (): Promise<TenantTransaction[]> => electron.ipcRenderer.invoke('get-all-tenants-transactions'),
deleteTenantTransaction: (transactionId: number): Promise<void> => electron.ipcRenderer.invoke('delete-tenant-transaction', transactionId),
getTenatnTransactionById: (transactionId: number): Promise<TenantTransactionDetailsProps | null> => electron.ipcRenderer.invoke('get-tenant-transaction-details', transactionId),
updateTenantTransaction: (
  transactionId: number,
  updatedTransaction: { amount: number; date: string; isPaid: boolean; description?: string }
): Promise<void> => electron.ipcRenderer.invoke('update-tenant-transaction', transactionId, updatedTransaction),
addInternalTransaction: (
  tx: InternalTransaction
): Promise<number> => electron.ipcRenderer.invoke('add-internal-transaction', tx),
  getAllInternalTransactions: (): Promise<InternalTransaction[]> => electron.ipcRenderer.invoke('get-all-internal-transactions'),
  getInternalTransactionById: (id: number): Promise<InternalTransaction | undefined> => electron.ipcRenderer.invoke('get-internal-transaction-by-id', id),
  updateInternalTransaction: (id: number, tx: Partial<InternalTransaction>): Promise<void> => electron.ipcRenderer.invoke('update-internal-transaction', id, tx),
  deleteInternalTransaction: (id: number): Promise<void> => electron.ipcRenderer.invoke('delete-internal-transaction', id),

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