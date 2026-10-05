import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserRequest,
  normalizeUserApiError,
} from '../../services/users/admin-api';
import type { ApiError, CreateUserInput, User } from '../../types/user.types';

export const createUser = createAsyncThunk<
  User,
  CreateUserInput,
  { rejectValue: ApiError }
>('users/createUser', async (input, { rejectWithValue }) => {
  try {
    return await createUserRequest(input);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return rejectWithValue(error as ApiError);
    }

    return rejectWithValue(normalizeUserApiError('UNKNOWN_ERROR', undefined));
  }
});
