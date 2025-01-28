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
      login: (username: string, password: string) => Promise<void>;
      logout: () => Promise<void>;
      deleteUser: (userId: number) => Promise<{deleted:boolean}>;
      onUserStatusUpdate: (callback: (status: UserStatus) => void) => void; // Corrected type
      subscribeChangeView: (
        callback: (view: View) => void
      ) => UnsubscribeFunction;
      sendFrameAction: (payload: FrameWindowAction) => void;
    };
  }

  interface UserStatus {
    isLoggedIn: boolean;
    username?: string;
  }