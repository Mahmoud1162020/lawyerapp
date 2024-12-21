import { createSlice } from '@reduxjs/toolkit';
import { NavState } from '../../types';

const initialState: NavState = {
  navName:0,

};

const authSlice = createSlice({
  name: 'nav',
  initialState,
  reducers: {
    navState: (state,action) => {
    
     state.navName = action.payload
     
      
    },
 
  },
});

export const { navState} = authSlice.actions;
export default authSlice.reducer;
