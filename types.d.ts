type Statistics = {
    cpuUsage: number;
    ramUsage: number;
    storageUsage: number;
    btnClicked: boolean
  };
  type Customer={    
      id: number;
      name: string;
      accountNumber: string;
      accountType: string;
      phone: string;
      address: string;
      date: string;
      details: string | null;
      debit: number;
      credit: number;

  }
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
    userId: number;
    recipient: string;
    amount: number;
    report: string;
    procedureId: number;
    type: "procedure" | "personal";
    transactionType: "incoming" | "outgoing";
    date: string;
  }
  type PersonalTransaction= {
    id: number;
    userId: number;
    customer_id: string;
    amount: number;
    report: string;
    type: "procedure" | "personal";
    transactionType: "incoming" | "outgoing";
    date: string;
    customer_name?:string;
    customer_accountNumber?: string;
    customer_accountType?: string;
    customer_phone?:string;
    customer_address?: string;
    customer_debit?: number;
    customer_credit?: number;
  }
  type Procedure={ 
    id: number;
    procedureNumber: string;
    procedureName: string;
    description: string;
    date: string;
    status: string;
    phone: string;
    owners: { id: number; name: string }[] 
  }
  type TenantTransaction = {
    contractStatus: string;
    startDate: string;
    tenantIds: number[];
    propertyId: number;
    endDate: string;
    entitlement: number;
    contractNumber: string;
    installmentCount: number;
    leasedUsage: string;
    propertyType: string;
  };
  type TenantResponse = {
    id: number;
    contractStatus: string;
    startDate: string;
    tenantNames: string[];
    propertyNumber: number;
    endDate: string;
    entitlement: number;
    contractNumber: string;
    installmentCount: number;
    leasedUsage: string;
    propertyType: string;
    propertyDetails: {
      id: number;
      propertyTitle: string;
      propertyNumber: string;
      address: string;
      price: number;
      date: string;
      details: string | null;
    };
  };
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
      onError: (callback: (error: string) => void) => void;
      offError: (callback: (error: string) => void) => void;
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
      ) => Promise<{ id: number }>;
      getAllTransactions: () => Promise<Transaction[]>;
      getTransactionById:(id:number)=>Promise<Transaction|null>
      
      getTransactionsByUser:(userId:number)=>Promise<Transaction>;
      updateTransaction:(id: number,
        field: string,
        value: string|number)=>Promise<{ updated: boolean }>;
        deleteTransaction:(transactionId: number)=>Promise<{ deleted: boolean }>;
        // Customers
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
      addTenant:(contractStatus:string,startDate:string,tenantIds:number[],propertyId:number,endDate:string,entitlement:number,contractNumber:string,installmentCount:number,leasedUsage:string,propertyType:string)=>Promise<{ id: number }>,
      getAllTenants: ()=>Promise<{ id: number; contractStatus: string; startDate: string; tenantNames: string[]; propertyNumber: number; endDate: string; entitlement: number; contractNumber: string; installmentCount: number; leasedUsage: string; propertyType: string,propertyDetails: {
        id: number,
        propertyTitle: string,
        propertyNumber: string,
        address: string,
        price: number,
        date: string
        details: string | null
      } }[]>,
      getTenantById: (id: number)=>Promise<{ id: number; contractStatus: string; startDate: string; tenantNames: [{ id: number; name: string; }]; propertyNumber: number; endDate: string; entitlement: number; contractNumber: string; installmentCount: number; leasedUsage: string; propertyType: string } | null>,
      deleteTenant: (id: number)=>Promise<{ deleted: boolean }>,
      updateTenant: (id: number, field: string, value: string | number)=>Promise<{ updated: boolean }>,
      updateTenantNames:(tenantId: number,tenantNames: numbers[])=>Promise<{ updated: boolean }>,
      addPersonalTransaction: (userId: number,customer_id: number,amount: number,report: string,transactionType:"incoming"|"outgoing",date: string)=>Promise<{ id: number }>,
      getAllPersonalTransactions: ()=>Promise<{ id: number; userId: number; customer_id: number; amount: number; report: string; date: string }[]>,
      getPersonalTransactionById: (id: number)=>Promise< PersonalTransaction | null>,
      updatePersonalTransaction: (id: number, field: string, value: string | number)=>Promise<{ updated: boolean }>,
      deletePersonalTransaction: (id: number)=>Promise<{ deleted: boolean }>,
      getPersonalTransactionsByDateRange: (startDate: string, endDate: string)=>Promise<{ id: number; userId: number; recipient: string; amount: number; report: string; date: string }[]>,
    //tenants transactions
      addTenantTransaction:(tenantId: number,propertyId: number,customerId: number,transaction: { amount: number; date: string; isPaid: boolean; description?: string })=>Promise<void>
      getTenantTransactions:(tenantId: number)=>Promise<TenantTransaction[]>,
      getAllTenantTransactions: ()=>Promise<TenantTransaction[]>,
      deleteTenantTransaction:(transactionId: number)=>Promise<void>,
      getTenatnTransactionById:(transactionId: number)=>Promise<TenantTransaction | null>
      updateTenantTransaction:(transactionId: number,updatedTransaction: { amount: number; date: string; isPaid: boolean })=>Promise<void>
    };

  }

  interface UserStatus {
    isLoggedIn: boolean;
    username?: string;
  }