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
      
    };

  }

  interface UserStatus {
    isLoggedIn: boolean;
    username?: string;
  }