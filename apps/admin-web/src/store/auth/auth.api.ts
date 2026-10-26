import { createAsyncThunk } from '@reduxjs/toolkit';
import { writePlatformSession } from '@niar/auth';
import {
  normalizeAuthApiError,
  updateAuthUserRequest,
} from '../../services/auth/auth.service';
import type {
  AuthApiError,
  AuthUser,
  ChangePasswordInput,
  UpdateProfileInput,
} from '../../types/user.types';

/** O PATCH devolve a sessão inteira; a shell e o @niar/auth leem daqui. */
function syncPlatformSession(user: AuthUser) {
  writePlatformSession(user);
  return user;
}

function toAuthApiError(error: unknown, fallback: AuthApiError): AuthApiError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return error as AuthApiError;
  }

  return fallback;
}

export const updateProfile = createAsyncThunk<
  AuthUser,
  UpdateProfileInput,
  { rejectValue: AuthApiError }
>('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    return syncPlatformSession(
      await updateAuthUserRequest({ operation: 'updateProfile', data }),
    );
  } catch (error) {
    return rejectWithValue(
      toAuthApiError(error, normalizeAuthApiError('UNKNOWN_ERROR', undefined, 'updateProfile')),
    );
  }
});

export const changePassword = createAsyncThunk<
  AuthUser,
  ChangePasswordInput,
  { rejectValue: AuthApiError }
>('auth/changePassword', async (data, { rejectWithValue }) => {
  try {
    return syncPlatformSession(
      await updateAuthUserRequest({ operation: 'changePassword', data }),
    );
  } catch (error) {
    return rejectWithValue(
      toAuthApiError(error, normalizeAuthApiError('UNKNOWN_ERROR', undefined, 'changePassword')),
    );
  }
});
