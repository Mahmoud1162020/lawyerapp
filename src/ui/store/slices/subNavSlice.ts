import { createSlice } from '@reduxjs/toolkit';
import { subNavState } from '../../types';

const initialState: subNavState = {
  subNavName:0,

};

const authSlice = createSlice({
  name: 'sub-nav',
  initialState,
  reducers: {
    navState: (state,action) => {
    
     state.subNavName = action.payload
     
      
    },
 
  },
});

export const { navState} = authSlice.actions;
export default authSlice.reducer;
