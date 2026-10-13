import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type { FetchSpecialtiesParams, SpecialtiesFilters, SpecialtiesPagination, Specialty, SpecialtyApiError } from '../../types/specialty.types';
import { createSpecialty, fetchSpecialties, updateSpecialty, updateSpecialtyStatus } from './specialties.api';

export type SpecialtiesStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export const DEFAULT_SPECIALTIES_PAGE_SIZE = 20;

const createDefaultSpecialtiesFilters = (): SpecialtiesFilters => ({});

export type SpecialtiesState = {
  specialties: Specialty[];
  selectedSpecialty: Specialty | null;
  pagination: SpecialtiesPagination | null;
  filters: SpecialtiesFilters;
  page: number;
  pageSize: number;
  status: SpecialtiesStatus;
  error: SpecialtyApiError | null;
};

export const initialSpecialtiesState: SpecialtiesState = {
  specialties: [],
  selectedSpecialty: null,
  pagination: null,
  filters: createDefaultSpecialtiesFilters(),
  page: 1,
  pageSize: DEFAULT_SPECIALTIES_PAGE_SIZE,
  status: 'idle',
  error: null,
};

const specialtiesSlice = createSlice({
  name: 'specialties',
  initialState: initialSpecialtiesState,
  reducers: {
    setSelectedSpecialty: (state, action: PayloadAction<Specialty>) => {
      state.selectedSpecialty = action.payload;
    },
    clearSelectedSpecialty: (state) => {
      state.selectedSpecialty = null;
    },
    clearSpecialtiesState: () => initialSpecialtiesState,
    setSpecialtiesFilters: (state, action: PayloadAction<SpecialtiesFilters>) => {
      state.filters = action.payload;
      state.page = 1;
    },
    clearSpecialtiesFilters: (state) => {
      state.filters = createDefaultSpecialtiesFilters();
      state.page = 1;
    },
    setSpecialtiesPage: (state, action: PayloadAction<number>) => {
      state.page = Math.max(1, action.payload);
    },
    setSpecialtiesPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = Math.max(1, action.payload);
      state.page = 1;
    },
    clearSpecialtiesError: (state) => {
      state.error = null;
      if (state.status === 'failed') state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpecialties.pending, (state, action) => {
        state.status = 'pending';
        state.error = null;
        state.filters = {
          ...(action.meta.arg?.query ? { query: action.meta.arg.query } : {}),
          ...(action.meta.arg?.isActive !== undefined ? { isActive: action.meta.arg.isActive } : {}),
        };
        state.page = action.meta.arg?.page ?? 1;
        state.pageSize = action.meta.arg?.pageSize ?? DEFAULT_SPECIALTIES_PAGE_SIZE;
      })
      .addCase(fetchSpecialties.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.specialties = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSpecialties.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Não foi possível carregar as especialidades.' };
      })
      .addMatcher(
        isAnyOf(createSpecialty.pending, updateSpecialty.pending, updateSpecialtyStatus.pending),
        (state) => {
          state.status = 'pending';
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(createSpecialty.fulfilled, updateSpecialty.fulfilled, updateSpecialtyStatus.fulfilled),
        (state, action) => {
          state.status = 'succeeded';
          state.error = null;
          state.selectedSpecialty = action.payload;
        },
      )
      .addMatcher(
        isAnyOf(createSpecialty.rejected, updateSpecialty.rejected, updateSpecialtyStatus.rejected),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload ?? { message: 'Não foi possível concluir a operação.' };
        },
      );
  },
});

export const {
  setSelectedSpecialty,
  clearSelectedSpecialty,
  clearSpecialtiesState,
  setSpecialtiesFilters,
  clearSpecialtiesFilters,
  setSpecialtiesPage,
  setSpecialtiesPageSize,
  clearSpecialtiesError,
} = specialtiesSlice.actions;

export const specialtiesReducer = specialtiesSlice.reducer;
export default specialtiesSlice.reducer;
