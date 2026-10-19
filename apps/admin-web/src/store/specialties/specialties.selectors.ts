import type { SpecialtiesState } from './specialties.slice';

export type SpecialtiesRootState = {
  specialties: SpecialtiesState;
};

const selectSpecialtiesState = (state: SpecialtiesRootState) => state.specialties;

export const selectSpecialtiesList = (state: SpecialtiesRootState) => selectSpecialtiesState(state).list.items;
export const selectSpecialtiesSelected = (state: SpecialtiesRootState) => selectSpecialtiesState(state).selected;
export const selectSpecialtiesListPagination = (state: SpecialtiesRootState) => selectSpecialtiesState(state).list.pagination;
export const selectSpecialtiesListFilters = (state: SpecialtiesRootState) => selectSpecialtiesState(state).list.filters;
export const selectSpecialtiesListPage = (state: SpecialtiesRootState) => selectSpecialtiesState(state).list.page;
export const selectSpecialtiesListPageSize = (state: SpecialtiesRootState) => selectSpecialtiesState(state).list.pageSize;
export const selectSpecialtiesListStatus = (state: SpecialtiesRootState) => selectSpecialtiesState(state).list.status;
export const selectSpecialtiesListLoading = (state: SpecialtiesRootState) => selectSpecialtiesState(state).list.status === 'pending';
export const selectSpecialtiesListError = (state: SpecialtiesRootState) => selectSpecialtiesState(state).list.error;
export const selectSpecialtiesListHasItems = (state: SpecialtiesRootState) => selectSpecialtiesState(state).list.items.length > 0;
export const selectSpecialtiesMutation = (state: SpecialtiesRootState) => selectSpecialtiesState(state).mutation;
export const selectSpecialtiesMutationError = (state: SpecialtiesRootState) => selectSpecialtiesState(state).mutation.error;
export const selectSpecialtiesMutationLoading = (state: SpecialtiesRootState) => selectSpecialtiesState(state).mutation.status === 'pending';
export const selectSpecialtiesMutationStatus = (state: SpecialtiesRootState) => selectSpecialtiesState(state).mutation.status;
export const selectSpecialtiesMutationOperation = (state: SpecialtiesRootState) => selectSpecialtiesState(state).mutation.operation;
