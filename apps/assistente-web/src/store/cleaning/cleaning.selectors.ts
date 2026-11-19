import type { RootState } from '..';
export const selectCleaningList = (state: RootState) => state.cleaning.items;
export const selectCurrentCleaning = (state: RootState) => state.cleaning.selected;
export const selectCleaningVersions = (state: RootState) => state.cleaning.versions;
export const selectCleaningListLoading = (state: RootState) => state.cleaning.list.status === 'pending';
export const selectCleaningError = (state: RootState) => state.cleaning.list.error;
export const selectCleaningOperation = (state: RootState) => state.cleaning.operation;
