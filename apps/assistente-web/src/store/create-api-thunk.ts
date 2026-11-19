import { createAsyncThunk } from '@reduxjs/toolkit';
import { toApiError } from '../services/http';
import type { ApiError } from '../types/api.types';

export function createApiThunk<Returned, Argument = void>(
  type: string,
  execute: (argument: Argument) => Promise<Returned>,
  fallback: string,
) {
  return createAsyncThunk<Returned, Argument, { rejectValue: ApiError }>(
    type,
    async (argument, { rejectWithValue }) => {
      try {
        return await execute(argument);
      } catch (error) {
        return rejectWithValue(toApiError(error, fallback));
      }
    },
  );
}
