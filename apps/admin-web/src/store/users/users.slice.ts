import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/user.types';

type UsersState = {
  selectedUser: User | null;
  lastCreatedUser: User | null;
};

const initialState: UsersState = {
  selectedUser: null,
  lastCreatedUser: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
    },
    setLastCreatedUser(state, action: PayloadAction<User | null>) {
      state.lastCreatedUser = action.payload;
    },
    clearUsersState(state) {
      state.selectedUser = null;
      state.lastCreatedUser = null;
    },
  },
});

export const { setSelectedUser, setLastCreatedUser, clearUsersState } = usersSlice.actions;
export const selectSelectedUser = (state: { users: UsersState }) => state.users.selectedUser;
export const selectLastCreatedUser = (state: { users: UsersState }) => state.users.lastCreatedUser;
export default usersSlice.reducer;
