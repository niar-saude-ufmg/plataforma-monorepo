import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserRequest,
  getUsersRequest,
  normalizeUserApiError,
  normalizeUserListApiError,
} from '../../services/users/users.service';
import type { ApiError } from '../../types/api.types';
import type {
  UserApiError,
  CreateUserInput,
  User,
  UserListParams,
  UserListResponse,
} from '../../types/user.types';

export const getUsers = createAsyncThunk<
  UserListResponse,
  UserListParams,
  { rejectValue: ApiError }
>('users/getUsers', async (params, { rejectWithValue }) => {
  try {
    return await getUsersRequest(params);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      return rejectWithValue(error as ApiError);
    }

    return rejectWithValue(normalizeUserListApiError('UNKNOWN_ERROR', undefined));
  }
});

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
