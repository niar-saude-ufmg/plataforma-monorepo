import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createSpecialty as createSpecialtyRequest,
  listSpecialties,
  updateSpecialty as updateSpecialtyRequest,
  updateSpecialtyStatus as updateSpecialtyStatusRequest,
} from '../../services/specialties/admin-api';
import type {
  ApiError,
  CreateSpecialtyInput,
  FetchSpecialtiesParams,
  SpecialtiesList,
  Specialty,
  UpdateSpecialtyRequest,
  UpdateSpecialtyStatusRequest,
} from '../../types/specialty.types';

type ThunkConfig = { rejectValue: ApiError };

const toApiError = (error: unknown): ApiError => {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error as ApiError;
  }

  return { message: 'Não foi possível concluir a operação.' };
};

export const fetchSpecialties = createAsyncThunk<SpecialtiesList, FetchSpecialtiesParams | undefined, ThunkConfig>(
  'specialties/fetchSpecialties',
  async (params, { rejectWithValue }) => {
    try {
      return await listSpecialties(params);
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const createSpecialty = createAsyncThunk<Specialty, CreateSpecialtyInput, ThunkConfig>(
  'specialties/createSpecialty',
  async (input, { rejectWithValue }) => {
    try {
      return await createSpecialtyRequest(input);
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const updateSpecialty = createAsyncThunk<Specialty, UpdateSpecialtyRequest, ThunkConfig>(
  'specialties/updateSpecialty',
  async ({ id, ...input }, { rejectWithValue }) => {
    try {
      return await updateSpecialtyRequest(id, input);
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const updateSpecialtyStatus = createAsyncThunk<Specialty, UpdateSpecialtyStatusRequest, ThunkConfig>(
  'specialties/updateSpecialtyStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      return await updateSpecialtyStatusRequest(id, isActive);
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);
