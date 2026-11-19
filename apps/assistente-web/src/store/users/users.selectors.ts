import type { RootState } from '..';
export const selectUsers = (state: RootState) => state.users.items;
export const selectUsersLoad = (state: RootState) => state.users.load;
export const selectUsersMutation = (state: RootState) => state.users.mutation;
