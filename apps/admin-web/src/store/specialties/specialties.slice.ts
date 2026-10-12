import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type { ApiError, SpecialtiesPagination, Specialty } from '../../types/specialty.types';
import { createSpecialty, fetchSpecialties, updateSpecialty, updateSpecialtyStatus } from './specialties.api';

export type SpecialtiesStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export type SpecialtiesState = {
  specialties: Specialty[];
  selectedSpecialty: Specialty | null;
  pagination: SpecialtiesPagination | null;
  status: SpecialtiesStatus;
  error: ApiError | null;
};

export const initialSpecialtiesState: SpecialtiesState = {
  specialties: [],
  selectedSpecialty: null,
  pagination: null,
  status: 'idle',
  error: null,
};

const upsertSpecialty = (specialties: Specialty[], specialty: Specialty) => {
  const index = specialties.findIndex(({ id }) => id === specialty.id);
  if (index === -1) {
    specialties.push(specialty);
  } else {
    specialties[index] = specialty;
  }
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
    clearSpecialtiesError: (state) => {
      state.error = null;
      if (state.status === 'failed') {
        state.status = 'idle';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpecialties.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.specialties = Array.from(new Map(action.payload.items.map((item) => [item.id, item])).values());
        state.pagination = action.payload.pagination;
      })
      .addCase(createSpecialty.fulfilled, (state, action) => {
        state.status = 'succeeded';
        upsertSpecialty(state.specialties, action.payload);
        state.selectedSpecialty = action.payload;
      })
      .addCase(updateSpecialty.fulfilled, (state, action) => {
        state.status = 'succeeded';
        upsertSpecialty(state.specialties, action.payload);
        state.selectedSpecialty = action.payload;
      })
      .addCase(updateSpecialtyStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        upsertSpecialty(state.specialties, action.payload);
        state.selectedSpecialty = action.payload;
      })
      .addMatcher(
        isAnyOf(
          fetchSpecialties.pending,
          createSpecialty.pending,
          updateSpecialty.pending,
          updateSpecialtyStatus.pending,
        ),
        (state) => {
          state.status = 'pending';
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchSpecialties.rejected,
          createSpecialty.rejected,
          updateSpecialty.rejected,
          updateSpecialtyStatus.rejected,
        ),
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
  clearSpecialtiesError,
} = specialtiesSlice.actions;

export const specialtiesReducer = specialtiesSlice.reducer;
export default specialtiesSlice.reducer;
