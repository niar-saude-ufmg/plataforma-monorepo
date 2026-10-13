import type { SpecialtiesState } from './specialties.slice';

export type SpecialtiesRootState = {
  specialties: SpecialtiesState;
};

const selectSpecialtiesState = (state: SpecialtiesRootState) => state.specialties;

export const selectSpecialties = (state: SpecialtiesRootState) => selectSpecialtiesState(state).specialties;
export const selectSelectedSpecialty = (state: SpecialtiesRootState) => selectSpecialtiesState(state).selectedSpecialty;
export const selectSpecialtiesPagination = (state: SpecialtiesRootState) => selectSpecialtiesState(state).pagination;
export const selectSpecialtiesFilters = (state: SpecialtiesRootState) => selectSpecialtiesState(state).filters;
export const selectSpecialtiesPage = (state: SpecialtiesRootState) => selectSpecialtiesState(state).page;
export const selectSpecialtiesPageSize = (state: SpecialtiesRootState) => selectSpecialtiesState(state).pageSize;
export const selectSpecialtiesStatus = (state: SpecialtiesRootState) => selectSpecialtiesState(state).status;
export const selectSpecialtiesLoading = (state: SpecialtiesRootState) => selectSpecialtiesState(state).status === 'pending';
export const selectSpecialtiesError = (state: SpecialtiesRootState) => selectSpecialtiesState(state).error;
export const selectSpecialtiesHasItems = (state: SpecialtiesRootState) => selectSpecialtiesState(state).specialties.length > 0;
