import { createSlice } from '@reduxjs/toolkit';

interface UpdateState {
    needsUpdate: boolean;
}

const initialState: UpdateState = {
    needsUpdate: false,
};

const updateSlice = createSlice({
    name: 'update',
    initialState,
    reducers: {
        triggerUpdate(state) {
            state.needsUpdate = true;
        },
        resetUpdate(state) {
            state.needsUpdate = false;
        },
    },
});

export const { triggerUpdate, resetUpdate } = updateSlice.actions;
export default updateSlice.reducer;