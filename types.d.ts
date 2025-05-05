type Statistics = {
    cpuUsage: number;
    ramUsage: number;
    storageUsage: number;
    btnClicked: boolean
  };
  
  type StaticData = {
    totalStorage: number;
    cpuModel: string;
    totalMemoryGB: number;
  };
  type User={
    id:number;
    username:string;
    password:string;
  }
  type Transaction= {
    id: number;
    user_id: number;
    recipient: string;
    amount: number;
    report: string;
    transactionId: string;
    date: string;
    username: string;
  }
  
  type View = 'CPU' | 'RAM' | 'STORAGE';
  
  type FrameWindowAction = 'CLOSE' | 'MAXIMIZE' | 'MINIMIZE';
  
  type EventPayloadMapping = {
    statistics: Statistics;
    getStaticData: StaticData;
    changeView: View;
    sendFrameAction: FrameWindowAction;
    buttonClicked: string
  };
  
  type UnsubscribeFunction = () => void;
  
  interface Window {
    electron: {
      subscribeStatistics: (
        callback: (statistics: Statistics) => void
      ) => UnsubscribeFunction;
      getStaticData: () => Promise<StaticData>;
      sendExit: () => void;
      register: (username: string, password: string) => Promise<void>;
      login: (username: string, password: string) => Promise<User>;
      getUser: () => Promise<User>;
      setUser: (user: User) => Promise<void>;
      logout: () => Promise<void>;
      deleteUser: (userId: number) => Promise<{deleted:boolean}>;
      onUserStatusUpdate: (callback: (status: UserStatus) => void) => void; // Corrected type
      subscribeChangeView: (
        callback: (view: View) => void
      ) => UnsubscribeFunction;
      sendFrameAction: (payload: FrameWindowAction) => void;
      addTransaction:( user_id: number,
        recipient: string,
        amount: number,
        report: string,
        transactionId: string)=>Promise<{ id: number }>;
      
      getTransactionsByUser:(userId:number)=>Promise<Transaction>;
      updateTransaction:(id: number,
        field: string,
        value: string|number)=>Promise<{ updated: boolean }>;
        deleteTransaction:(transactionId: number)=>Promise<{ deleted: boolean }>;
        addCustomersAccount:(
        name:string,
        accountNumber: string,
        accountType: string,
        phone: string,
        address: string,
        details: string)=>Promise<{ id: number }>;
      getAllCustomersAccounts: ()=>Promise<{ id: number; name: string; accountNumber: string; accountType: string; phone: string; address: string; date: string; details: string | null }[]>,
      deleteCustomersAccount: (id: number)=>Promise<{ deleted: boolean }>,
      getCustomersAccountById: (id: number)=> Promise<{ id: number;name:string; accountNumber: string; accountType: string; phone: string; address: string; date: string; details: string | null } | null>,
      updateCustomersAccount: (id: number, field: string, value: string | number)=>Promise<{ updated: boolean }>
      addRealState: (propertyTitle: string,propertyNumber: string,address: string,price: number,details: string,owners: number[])=> Promise<{ id: number }>
      getAllRealStates: ()=>Promise<{ id: number; propertyTitle: string; propertyNumber: string; address: string; price: number; date: string; details: string | null; owners: { id: number; name: string }[] }[]>,
      getRealStateById: (id: number)=>Promise<{ id: number; propertyTitle: string; propertyNumber: string; address: string; price: number; date: string; details: string | null; owners: { id: number; name: string }[] } | null>,
      deleteRealState: (id: number)=> Promise<{ deleted: boolean }>,
      updateRealState: (id: number, field: string, value: string | number)=> Promise<{ updated: boolean }> ,
      updateRealStateOwners: (realStateId: number, owners: number[])=>Promise<{ updated: boolean }> ,
      addProcedure: (procedureNumber:string,procedureName:string, description: string,date: string,status: string,phone: string,owners: number[])=>Promise<{ id: number }>,
      getAllProcedures: ()=>Promise<{ id: number; procedureNumber: string; procedureName: string; description: string; date: string; status: string; phone: string; owners: { id: number; name: string }[] }[]>,
      getProcedureById: (id: number)=>Promise<{ id: number; procedureNumber: string; procedureName: string; description: string; date: string; status: string; phone: string; owners: { id: number; name: string }[] } | null>,
      deleteProcedure: (id: number)=>Promise<{ deleted: boolean }>,
      updateProcedure: (id: number, field: string, value: string | number)=>Promise<{ updated: boolean }>,
      updateProcedureOwners: (procedureId: number, owners: number[])=>Promise<{ updated: boolean }>
      addTenant:(contractStatus:string,startDate:string,tenantIds:number[],propertyNumber:number,endDate:string,entitlement:number,contractNumber:string,installmentCount:number,leasedUsage:string,propertyType:string)=>Promise<{ id: number }>,
      getAllTenants: ()=>Promise<{ id: number; contractStatus: string; startDate: string; tenantNames: string[]; propertyNumber: number; endDate: string; entitlement: number; contractNumber: string; installmentCount: number; leasedUsage: string; propertyType: string }[]>,
      getTenantById: (id: number)=>Promise<{ id: number; contractStatus: string; startDate: string; tenantNames: string[]; propertyNumber: number; endDate: string; entitlement: number; contractNumber: string; installmentCount: number; leasedUsage: string; propertyType: string } | null>,
      deleteTenant: (id: number)=>Promise<{ deleted: boolean }>,
      updateTenant: (id: number, field: string, value: string | number)=>Promise<{ updated: boolean }>
      updateTenantNames:(tenantId: number,tenantNames: numbers[])=>Promise<{ updated: boolean }>
    };

  }

  interface UserStatus {
    isLoggedIn: boolean;
    username?: string;
  }