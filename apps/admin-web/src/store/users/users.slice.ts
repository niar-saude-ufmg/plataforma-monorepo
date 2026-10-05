import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/user.types';
import type { ApiError } from '../../types/user.types';
import { createUser } from './users.api';

export type UsersStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export type UsersState = {
  selectedUser: User | null;
  lastCreatedUser: User | null;
  status: UsersStatus;
  error: ApiError | null;
};

const initialState: UsersState = {
  selectedUser: null,
  lastCreatedUser: null,
  status: 'idle',
  error: null,
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
      state.status = 'idle';
      state.error = null;
    },
    clearUsersError(state) {
      state.error = null;
      if (state.status === 'failed') {
        state.status = 'idle';
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createUser.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.error = null;
      state.lastCreatedUser = action.payload;
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? {
        message: 'Não foi possível cadastrar o pesquisador. Tente novamente.',
      };
    });
  },
});

export const {
  setSelectedUser,
  setLastCreatedUser,
  clearUsersState,
  clearUsersError,
} = usersSlice.actions;
export const selectSelectedUser = (state: { users: UsersState }) => state.users.selectedUser;
export const selectLastCreatedUser = (state: { users: UsersState }) => state.users.lastCreatedUser;
export const selectError = (state: { users: UsersState }) => state.users.error;
export const selectIsLoading = (state: { users: UsersState }) => state.users.status === 'pending';
export default usersSlice.reducer;
