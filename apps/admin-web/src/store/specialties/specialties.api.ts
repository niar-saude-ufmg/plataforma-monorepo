import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../index';
import {
  createSpecialty as createSpecialtyRequest,
  listSpecialties,
  updateSpecialty as updateSpecialtyRequest,
  updateSpecialtyStatus as updateSpecialtyStatusRequest,
} from '../../services/specialties/specialties.service';
import type {
  CreateSpecialtyInput,
  FetchSpecialtiesParams,
  SpecialtiesList,
  Specialty,
  UpdateSpecialtyRequest,
  UpdateSpecialtyStatusRequest,
} from '../../types/specialty.types';
import type { SpecialtyApiError } from '../../types/specialty.types';

type ThunkConfig = { rejectValue: SpecialtyApiError; state: RootState; dispatch: AppDispatch };

const toApiError = (error: unknown): SpecialtyApiError => {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error as SpecialtyApiError;
  }

  return { message: 'Não foi possível concluir a operação.' };
};

const refreshSpecialties = async (dispatch: AppDispatch, getState: () => RootState) => {
  const { filters, page, pageSize } = getState().specialties.list;
  await dispatch(fetchSpecialties({ ...filters, page, pageSize }));
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
  async (input, { rejectWithValue, dispatch, getState }) => {
    try {
      const specialty = await createSpecialtyRequest(input);
      await refreshSpecialties(dispatch, getState);
      return specialty;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const updateSpecialty = createAsyncThunk<Specialty, UpdateSpecialtyRequest, ThunkConfig>(
  'specialties/updateSpecialty',
  async ({ id, ...input }, { rejectWithValue, dispatch, getState }) => {
    try {
      const specialty = await updateSpecialtyRequest(id, input);
      await refreshSpecialties(dispatch, getState);
      return specialty;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);

export const updateSpecialtyStatus = createAsyncThunk<Specialty, UpdateSpecialtyStatusRequest, ThunkConfig>(
  'specialties/updateSpecialtyStatus',
  async ({ id, isActive }, { rejectWithValue, dispatch, getState }) => {
    try {
      const specialty = await updateSpecialtyStatusRequest(id, isActive);
      await refreshSpecialties(dispatch, getState);
      return specialty;
    } catch (error) {
      return rejectWithValue(toApiError(error));
    }
  },
);
