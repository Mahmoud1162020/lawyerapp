import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UsersState {
    users: User[];
}

const initialState: UsersState = {
    users: [],
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsers(state, action: PayloadAction<User>) {
            state.users = action.payload;
        },
        addUser(state, action: PayloadAction<User>) {
            state.users.push(action.payload);
        },
        updateUser(state, action: PayloadAction<User>) {
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        },
        removeUser(state, action: PayloadAction<string>) {
            state.users = state.users.filter(u => u.id !== action.payload);
        },
    },
});

export const { setUsers, addUser, updateUser, removeUser } = usersSlice.actions;
export default usersSlice.reducer;