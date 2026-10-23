import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserRequest,
  downloadUserCoepDocumentRequest,
  getUsersRequest,
  normalizeUserApiError,
  normalizeUserDocumentApiError,
  normalizeUserListApiError,
} from '../../services/users/users.service';
import { downloadBlob } from '../../utils/download-file';
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

export const downloadUserCoepDocument = createAsyncThunk<
  { filename: string },
  number,
  { rejectValue: ApiError }
>('users/downloadCoepDocument', async (userId, { rejectWithValue }) => {
  try {
    const file = await downloadUserCoepDocumentRequest(userId);
    downloadBlob(file);
    return { filename: file.filename };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      return rejectWithValue(error as ApiError);
    }

    return rejectWithValue(normalizeUserDocumentApiError('UNKNOWN_ERROR'));
  }
});
