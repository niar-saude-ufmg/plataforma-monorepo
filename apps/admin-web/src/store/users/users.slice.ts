import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserApiError, UserListFilters, UserListItem, UserListPagination } from '../../types/user.types';
import type { AsyncStatus, FileState, MutationState, ResourceState } from '../../types/resource.types';
import {
  createUser,
  downloadUserCoepDocument,
  createResearcher,
  createAdministrator,
  createAuditor,
  createCommitteeMember,
  getUsers
} from './users.api';

export type UsersStatus = AsyncStatus;
export type UserMutationOperation = 'create' | 'update' | 'approve' | 'reject';

export const DEFAULT_USERS_PAGE_SIZE = 20;

const createDefaultUsersFilters = (): UserListFilters => ({});

export type UsersState = ResourceState<
  UserListItem,
  UserListFilters,
  UserListPagination,
  UserApiError,
  UserMutationOperation
> & {
  selected: UserListItem | null;
  mutation: MutationState<UserApiError, UserMutationOperation>;
  download: FileState<UserApiError>;
};

const initialState: UsersState = {
  list: {
    items: [],
    pagination: null,
    filters: createDefaultUsersFilters(),
    page: 1,
    pageSize: DEFAULT_USERS_PAGE_SIZE,
    status: 'idle',
    error: null,
  },
  selected: null,
  mutation: { operation: null, status: 'idle', error: null },
  download: { status: 'idle', error: null, filename: null },
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<UserListItem | null>) {
      state.selected = action.payload;
    },
    clearSelectedUser(state) {
      state.selected = null;
    },
    setUsersFilters(state, action: PayloadAction<UserListFilters>) {
      state.list.filters = action.payload;
      state.list.page = 1;
    },
    clearUsersFilters(state) {
      state.list.filters = createDefaultUsersFilters();
      state.list.page = 1;
    },
    setUsersPage(state, action: PayloadAction<number>) {
      state.list.page = Math.max(1, action.payload);
    },
    setUsersPageSize(state, action: PayloadAction<number>) {
      state.list.pageSize = Math.max(1, action.payload);
      state.list.page = 1;
    },
    clearUsersState(state) {
      state.list = {
        items: [],
        pagination: null,
        filters: createDefaultUsersFilters(),
        page: 1,
        pageSize: DEFAULT_USERS_PAGE_SIZE,
        status: 'idle',
        error: null,
      };
      state.selected = null;
      state.mutation = { operation: null, status: 'idle', error: null };
      state.download = { status: 'idle', error: null, filename: null };
    },
    clearUsersError(state) {
      state.list.error = null;
      state.mutation.error = null;
      state.download.error = null;
      if (state.list.status === 'failed') {
        state.list.status = 'idle';
      }
      if (state.mutation.status === 'failed') {
        state.mutation.status = 'idle';
      }
      if (state.download.status === 'failed') {
        state.download.status = 'idle';
      }
    },
    clearUsersListError(state) {
      state.list.error = null;
      if (state.list.status === 'failed') state.list.status = 'idle';
    },
    clearUsersMutationError(state) {
      state.mutation.error = null;
      if (state.mutation.status === 'failed') state.mutation.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUsers.pending, (state, action) => {
      state.list.status = 'pending';
      state.list.error = null;
      state.list.filters = {
        ...(action.meta.arg.search ? { search: action.meta.arg.search } : {}),
        ...(action.meta.arg.role ? { role: action.meta.arg.role } : {}),
        ...(action.meta.arg.accountStatus ? { accountStatus: action.meta.arg.accountStatus } : {}),
      };
      state.list.page = action.meta.arg.page ?? 1;
      state.list.pageSize = action.meta.arg.pageSize ?? DEFAULT_USERS_PAGE_SIZE;
    });
    builder.addCase(getUsers.fulfilled, (state, action) => {
      state.list.status = 'succeeded';
      state.list.error = null;
      state.list.items = action.payload.items;
      state.list.pagination = action.payload.pagination;
    });
    builder.addCase(getUsers.rejected, (state, action) => {
      state.list.status = 'failed';
      state.list.error = action.payload ?? {
        message: 'Não foi possível carregar os usuários. Tente novamente.',
      };
    });

    const createThunks = [
      createUser,
      createResearcher,
      createAdministrator,
      createAuditor,
      createCommitteeMember,
    ] as const;
    for (const thunk of createThunks) {
      builder.addCase(thunk.pending, (state) => {
        state.mutation = { operation: 'create', status: 'pending', error: null };
      });
      builder.addCase(thunk.fulfilled, (state) => {
        state.mutation = { operation: 'create', status: 'succeeded', error: null };
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.mutation = {
          operation: 'create',
          status: 'failed',
          error: action.payload ?? {
            message: 'Não foi possível cadastrar o usuário. Tente novamente.',
          },
        };
      });
    }

    builder.addCase(downloadUserCoepDocument.pending, (state) => {
      state.download = { status: 'pending', error: null, filename: null };
    });
    builder.addCase(downloadUserCoepDocument.fulfilled, (state, action) => {
      state.download = { status: 'succeeded', error: null, filename: action.payload.filename };
    });
    builder.addCase(downloadUserCoepDocument.rejected, (state, action) => {
      state.download = {
        status: 'failed',
        error: action.payload ?? {
          message: 'Não foi possível baixar o documento do COEP. Tente novamente.',
        },
        filename: null,
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
  clearUsersListError,
  clearUsersMutationError,
} = usersSlice.actions;
export default usersSlice.reducer;
