import type { SpecialtiesState } from './specialties.slice';

export type SpecialtiesRootState = { specialties: SpecialtiesState };

export const selectSpecialtiesList = (state: SpecialtiesRootState) => state.specialties.list.items;
export const selectSpecialtiesListPagination = (state: SpecialtiesRootState) => state.specialties.list.pagination;
export const selectSpecialtiesListFilters = (state: SpecialtiesRootState) => state.specialties.list.filters;
export const selectSpecialtiesListPage = (state: SpecialtiesRootState) => state.specialties.list.page;
export const selectSpecialtiesListPageSize = (state: SpecialtiesRootState) => state.specialties.list.pageSize;
export const selectSpecialtiesListStatus = (state: SpecialtiesRootState) => state.specialties.list.status;
export const selectSpecialtiesListLoading = (state: SpecialtiesRootState) => state.specialties.list.status === 'pending';
export const selectSpecialtiesListError = (state: SpecialtiesRootState) => state.specialties.list.error;
export const selectSpecialtiesListHasItems = (state: SpecialtiesRootState) => state.specialties.list.items.length > 0;
export const selectSpecialtiesSelected = (state: SpecialtiesRootState) => state.specialties.selected;
export const selectSpecialtiesMutation = (state: SpecialtiesRootState) => state.specialties.mutation;
export const selectSpecialtiesMutationStatus = (state: SpecialtiesRootState) => state.specialties.mutation.status;
export const selectSpecialtiesMutationLoading = (state: SpecialtiesRootState) => state.specialties.mutation.status === 'pending';
export const selectSpecialtiesMutationError = (state: SpecialtiesRootState) => state.specialties.mutation.error;
export const selectSpecialtiesMutationOperation = (state: SpecialtiesRootState) => state.specialties.mutation.operation;
