import type { UsersState } from './users.slice';

export type UsersRootState = {
  users: UsersState;
};

const selectUsersState = (state: UsersRootState) => state.users;

export const selectUsers = (state: UsersRootState) => selectUsersState(state).users;
export const selectSelectedUser = (state: UsersRootState) => selectUsersState(state).selectedUser;
export const selectUsersPagination = (state: UsersRootState) => selectUsersState(state).pagination;
export const selectUsersFilters = (state: UsersRootState) => selectUsersState(state).filters;
export const selectUsersPage = (state: UsersRootState) => selectUsersState(state).page;
export const selectUsersPageSize = (state: UsersRootState) => selectUsersState(state).pageSize;
export const selectUsersStatus = (state: UsersRootState) => selectUsersState(state).status;
export const selectUsersError = (state: UsersRootState) => selectUsersState(state).error;
export const selectUsersLoading = (state: UsersRootState) => selectUsersState(state).status === 'pending';
export const selectUsersHasItems = (state: UsersRootState) => selectUsersState(state).users.length > 0;
