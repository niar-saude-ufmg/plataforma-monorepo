import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserRequest,
  normalizeUserApiError,
} from '../../services/users/admin-api';
import type { UserApiError, CreateUserInput, User } from '../../types/user.types';

export const createUser = createAsyncThunk<
  User,
  CreateUserInput,
  { rejectValue: UserApiError }
>('users/createUser', async (input, { rejectWithValue }) => {
  try {
    return await createUserRequest(input);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return rejectWithValue(error as UserApiError);
    }

    return rejectWithValue(normalizeUserApiError('UNKNOWN_ERROR', undefined));
  }
});
