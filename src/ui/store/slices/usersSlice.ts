import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UsersState {
    user: User;
}

const initialState: UsersState = {
    user:{} as User, // Initialize with an empty User object
};

const usersSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
        },
        
    },
});

export const { setUser } = usersSlice.actions;
export default usersSlice.reducer;