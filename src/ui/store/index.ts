import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import navReducer from './slices/navSlice';
import subNavReducer from './slices/subNavSlice';
import { RootState } from '../types';
import financeReducer from './slices/financeSlice';
import userReducer from './slices/usersSlice';


export const store = configureStore({
  reducer: {
    nav: navReducer,
    subNav:subNavReducer,
    finance:financeReducer,
    user:userReducer
  
  },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         // Ignore these action types
//         ignoredActions: ['auth/loginSuccess'],
//       },
//     }),
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
