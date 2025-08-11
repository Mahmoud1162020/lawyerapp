import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FinanceState } from '../../types';


const initialState: FinanceState = {
    totalCredit: 0,
    totalDebit: 0,
};

const financeSlice = createSlice({
    name: 'finance',
    initialState,
    reducers: {
        addCredit(state, action: PayloadAction<number>) {
            state.totalCredit = action.payload;
        },
        addDebit(state, action: PayloadAction<number>) {
            state.totalDebit = action.payload;
        },
        resetFinance(state) {
            state.totalCredit = 0;
            state.totalDebit = 0;
        },
    },
});

export const { addCredit, addDebit, resetFinance } = financeSlice.actions;
export default financeSlice.reducer;