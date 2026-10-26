import type { UsersState } from './users.slice';

export type UsersRootState = {
  users: UsersState;
};

const selectUsersState = (state: UsersRootState) => state.users;

export const selectUsersList = (state: UsersRootState) => selectUsersState(state).list.items;
export const selectUsersSelected = (state: UsersRootState) => selectUsersState(state).selected;
export const selectUsersListPagination = (state: UsersRootState) => selectUsersState(state).list.pagination;
export const selectUsersListFilters = (state: UsersRootState) => selectUsersState(state).list.filters;
export const selectUsersListPage = (state: UsersRootState) => selectUsersState(state).list.page;
export const selectUsersListPageSize = (state: UsersRootState) => selectUsersState(state).list.pageSize;
export const selectUsersListStatus = (state: UsersRootState) => selectUsersState(state).list.status;
export const selectUsersListError = (state: UsersRootState) => selectUsersState(state).list.error;
export const selectUsersListLoading = (state: UsersRootState) => selectUsersState(state).list.status === 'pending';
export const selectUsersListHasItems = (state: UsersRootState) => selectUsersState(state).list.items.length > 0;
export const selectUsersMutation = (state: UsersRootState) => selectUsersState(state).mutation;
export const selectUsersMutationError = (state: UsersRootState) => selectUsersState(state).mutation.error;
export const selectUsersMutationLoading = (state: UsersRootState) => selectUsersState(state).mutation.status === 'pending';
export const selectUsersMutationStatus = (state: UsersRootState) => selectUsersState(state).mutation.status;
export const selectUsersMutationOperation = (state: UsersRootState) => selectUsersState(state).mutation.operation;
export const selectUsersDownload = (state: UsersRootState) => selectUsersState(state).download;
export const selectUsersDownloadStatus = (state: UsersRootState) => selectUsersState(state).download.status;
export const selectUsersDownloadLoading = (state: UsersRootState) => selectUsersState(state).download.status === 'pending';
export const selectUsersDownloadError = (state: UsersRootState) => selectUsersState(state).download.error;
export const selectUsersDownloadFilename = (state: UsersRootState) => selectUsersState(state).download.filename;
