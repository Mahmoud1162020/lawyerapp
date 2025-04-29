export interface RootState {
    nav: NavState;
    subNav:subNavState;
    user: UserState;
    settings: SettingsState;
  }
  
  export interface NavState {
    navName: number;
    
  }
  export interface subNavState {
    subNavName: number;
    
  }
  
  export interface UserState {
    profile: UserProfile | null;
    // preferences: UserPreferences;
    loading: boolean;
    error: string | null;
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
  
//   export interface UserPreferences {
//     [key: string]: any;
//   }