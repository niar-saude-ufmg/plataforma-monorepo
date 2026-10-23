import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type { AsyncStatus, MutationState, ResourceState } from '../../types/resource.types';
import type {
  SpecialtyApiError,
  SpecialtyListFilters,
  SpecialtyListItem,
  SpecialtyListPagination,
  SpecialtyMutationOperation,
} from '../../types/specialty.types';
import { createSpecialty, fetchSpecialties, updateSpecialty, updateSpecialtyStatus } from './specialties.api';

export type SpecialtiesStatus = AsyncStatus;

export const DEFAULT_SPECIALTIES_PAGE_SIZE = 20;

const createDefaultSpecialtiesFilters = (): SpecialtyListFilters => ({});

export type SpecialtiesState = ResourceState<
  SpecialtyListItem,
  SpecialtyListFilters,
  SpecialtyListPagination,
  SpecialtyApiError,
  SpecialtyMutationOperation
> & {
  selected: SpecialtyListItem | null;
  mutation: MutationState<SpecialtyApiError, SpecialtyMutationOperation>;
};

export const initialSpecialtiesState: SpecialtiesState = {
  list: {
    items: [],
    pagination: null,
    filters: createDefaultSpecialtiesFilters(),
    page: 1,
    pageSize: DEFAULT_SPECIALTIES_PAGE_SIZE,
    status: 'idle',
    error: null,
  },
  selected: null,
  mutation: { operation: null, status: 'idle', error: null },
};

const specialtiesSlice = createSlice({
  name: 'specialties',
  initialState: initialSpecialtiesState,
  reducers: {
    setSelectedSpecialty: (state, action: PayloadAction<SpecialtyListItem>) => {
      state.selected = action.payload;
    },
    clearSelectedSpecialty: (state) => {
      state.selected = null;
    },
    clearSpecialtiesMutation: (state) => {
      state.mutation = { operation: null, status: 'idle', error: null };
    },
    clearSpecialtiesState: () => initialSpecialtiesState,
    setSpecialtiesFilters: (state, action: PayloadAction<SpecialtyListFilters>) => {
      state.list.filters = action.payload;
      state.list.page = 1;
    },
    clearSpecialtiesFilters: (state) => {
      state.list.filters = createDefaultSpecialtiesFilters();
      state.list.page = 1;
    },
    setSpecialtiesPage: (state, action: PayloadAction<number>) => {
      state.list.page = Math.max(1, action.payload);
    },
    setSpecialtiesPageSize: (state, action: PayloadAction<number>) => {
      state.list.pageSize = Math.max(1, action.payload);
      state.list.page = 1;
    },
    clearSpecialtiesError: (state) => {
      state.list.error = null;
      if (state.list.status === 'failed') state.list.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpecialties.pending, (state, action) => {
        state.list.status = 'pending';
        state.list.error = null;
        state.list.filters = {
          ...(action.meta.arg?.query ? { query: action.meta.arg.query } : {}),
          ...(action.meta.arg?.isActive !== undefined ? { isActive: action.meta.arg.isActive } : {}),
        };
        state.list.page = action.meta.arg?.page ?? 1;
        state.list.pageSize = action.meta.arg?.pageSize ?? DEFAULT_SPECIALTIES_PAGE_SIZE;
      })
      .addCase(fetchSpecialties.fulfilled, (state, action) => {
        state.list.status = 'succeeded';
        state.list.error = null;
        state.list.items = action.payload.items;
        state.list.pagination = action.payload.pagination;
      })
      .addCase(fetchSpecialties.rejected, (state, action) => {
        state.list.status = 'failed';
        state.list.error = action.payload ?? { message: 'Não foi possível carregar as especialidades.' };
      })
      .addMatcher(
        isAnyOf(createSpecialty.pending, updateSpecialty.pending, updateSpecialtyStatus.pending),
        (state, action) => {
          const operation = createSpecialty.pending.match(action)
            ? 'create'
            : updateSpecialty.pending.match(action) ? 'update' : 'status';
          state.mutation = { operation, status: 'pending', error: null };
        },
      )
      .addMatcher(
        isAnyOf(createSpecialty.fulfilled, updateSpecialty.fulfilled, updateSpecialtyStatus.fulfilled),
        (state, action) => {
          const operation = createSpecialty.fulfilled.match(action)
            ? 'create'
            : updateSpecialty.fulfilled.match(action) ? 'update' : 'status';
          state.mutation = { operation, status: 'succeeded', error: null };
          state.selected = action.payload;
        },
      )
      .addMatcher(
        isAnyOf(createSpecialty.rejected, updateSpecialty.rejected, updateSpecialtyStatus.rejected),
        (state, action) => {
          const operation = createSpecialty.rejected.match(action)
            ? 'create'
            : updateSpecialty.rejected.match(action) ? 'update' : 'status';
          state.mutation = {
            operation,
            status: 'failed',
            error: action.payload ?? { message: 'Não foi possível concluir a operação.' },
          };
        },
      );
  },
});

export const {
  setSelectedSpecialty,
  clearSelectedSpecialty,
  clearSpecialtiesState,
  clearSpecialtiesMutation,
  setSpecialtiesFilters,
  clearSpecialtiesFilters,
  setSpecialtiesPage,
  setSpecialtiesPageSize,
  clearSpecialtiesError,
} = specialtiesSlice.actions;

export const specialtiesReducer = specialtiesSlice.reducer;
export default specialtiesReducer;
