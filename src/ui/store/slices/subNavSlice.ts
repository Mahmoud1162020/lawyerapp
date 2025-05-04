import { createSlice } from '@reduxjs/toolkit';
import { subNavState } from '../../types';

const initialState: subNavState = {
  subNavState:0,

};

const subNavSlice = createSlice({
  name: 'sub-nav',
  initialState,
  reducers: {
    subNav: (state, action) => {
      state.subNavState = action.payload;
    },
 
  },
});

export const { subNav} = subNavSlice.actions;
export default subNavSlice.reducer;
