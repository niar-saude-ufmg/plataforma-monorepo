import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserApiError, UserListFilters, UserListItem, UserPagination } from '../../types/user.types';
import { createUser, getUsers } from './users.api';

export type UsersStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export const DEFAULT_USERS_PAGE_SIZE = 10;

const createDefaultUsersFilters = (): UserListFilters => ({});

export type UsersState = {
  users: UserListItem[];
  selectedUser: UserListItem | null;
  pagination: UserPagination | null;
  filters: UserListFilters;
  page: number;
  pageSize: number;
  status: UsersStatus;
  error: UserApiError | null;
};

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  pagination: null,
  filters: createDefaultUsersFilters(),
  page: 1,
  pageSize: DEFAULT_USERS_PAGE_SIZE,
  status: 'idle',
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<UserListItem | null>) {
      state.selectedUser = action.payload;
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
    setUsersFilters(state, action: PayloadAction<UserListFilters>) {
      state.filters = action.payload;
      state.page = 1;
    },
    clearUsersFilters(state) {
      state.filters = createDefaultUsersFilters();
      state.page = 1;
    },
    setUsersPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    setUsersPageSize(state, action: PayloadAction<number>) {
      state.pageSize = Math.max(1, action.payload);
      state.page = 1;
    },
    clearUsersState(state) {
      state.users = [];
      state.selectedUser = null;
      state.pagination = null;
      state.filters = createDefaultUsersFilters();
      state.page = 1;
      state.pageSize = DEFAULT_USERS_PAGE_SIZE;
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
    builder.addCase(getUsers.pending, (state, action) => {
      state.status = 'pending';
      state.error = null;
      state.filters = {
        ...(action.meta.arg.role ? { role: action.meta.arg.role } : {}),
        ...(action.meta.arg.accountStatus ? { accountStatus: action.meta.arg.accountStatus } : {}),
      };
      state.page = action.meta.arg.page ?? 1;
      state.pageSize = action.meta.arg.pageSize ?? DEFAULT_USERS_PAGE_SIZE;
    });
    builder.addCase(getUsers.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.error = null;
      state.users = action.payload.items;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getUsers.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? {
        message: 'Não foi possível carregar os usuários. Tente novamente.',
      };
    });
    builder.addCase(createUser.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    });
    builder.addCase(createUser.fulfilled, (state) => {
      state.status = 'succeeded';
      state.error = null;
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
  clearSelectedUser,
  setUsersFilters,
  clearUsersFilters,
  setUsersPage,
  setUsersPageSize,
  clearUsersState,
  clearUsersError,
} = usersSlice.actions;
export default usersSlice.reducer;
