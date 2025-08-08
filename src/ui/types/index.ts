export interface RootState {
    nav: NavState;
    subNav:subNavState;
    user: UserState;
    settings: SettingsState;
    finance: FinanceState;
  }
  
  export interface NavState {
    navName: number;
    
  }
  export interface subNavState {
    subNavState: number;
    
  }
  
  export interface UserState {
    profile?: UserProfile | null;
    user?: User | null;
    loading?: boolean;
    error?: string | null;
  }

  export interface User {
    id: string;
    username: string;
    email: string;
    // Add other user fields as needed
  }
  
  export interface SettingsState {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  }
  
  export interface UserProfile {
    id: string;
    name: string;
    email: string;
  }

 export interface FinanceState {
    totalCredit: number;
    totalDebit: number;
}

  
//   export interface UserPreferences {
//     [key: string]: any;
//   }