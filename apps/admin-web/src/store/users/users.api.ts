import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserRequest,
  updateUserStatusRequest,
  createResearcherRequest,
  createAdministratorRequest,
  createCommitteeMemberRequest,
  downloadUserCoepDocumentRequest,
  getUsersRequest,
  normalizeUserApiError,
  normalizeUserDocumentApiError,
  normalizeUserListApiError,
  createUserAuthEvaluationRequest,
} from '../../services/users/users.service';
import { downloadBlob } from '../../utils/download-file';
import type { ApiError } from '../../types/api.types';
import type {
  UserApiError,
  UserListItem,
  UpdateUserStatusInput,
  CreateUserInput,
  CreateAdministratorInput,
  CreateCommitteeMemberInput,
  User,
  UserListParams,
  UserListResponse,
  UserAuthEvaluation,
  UserAuthEvaluationInput,
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

// ! Se possível melhorar o nome da função.
/** Cadastro público de Pesquisador. Endpoint público, sem auth. */
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

/** Cadastro privado de Pesquisador. Endpoint autenticado. */
export const createResearcher = createAsyncThunk<
  User,
  CreateUserInput,
  { rejectValue: UserApiError }
>('users/createResearcher', async (input, { rejectWithValue }) => {
  try {
    return await createResearcherRequest(input);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return rejectWithValue(error as UserApiError);
    }
    return rejectWithValue(
      normalizeUserApiError(
        'UNKNOWN_ERROR',
        undefined,
        'Não foi possível cadastrar o pesquisador.',
      ),
    );
  }
});

/** Cadastro privado de Administrador. */
export const createAdministrator = createAsyncThunk<
  User,
  CreateAdministratorInput,
  { rejectValue: UserApiError }
>('users/createAdministrator', async (input, { rejectWithValue }) => {
  try {
    return await createAdministratorRequest(input);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return rejectWithValue(error as UserApiError);
    }
    return rejectWithValue(
      normalizeUserApiError(
        'UNKNOWN_ERROR',
        undefined,
        'Não foi possível cadastrar o administrador.',
      ),
    );
  }
});

/** Cadastro privado de Membro do Comitê. */
export const createCommitteeMember = createAsyncThunk<
  User,
  CreateCommitteeMemberInput,
  { rejectValue: UserApiError }
>('users/createCommitteeMember', async (input, { rejectWithValue }) => {
  try {
    return await createCommitteeMemberRequest(input);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return rejectWithValue(error as UserApiError);
    }
    return rejectWithValue(
      normalizeUserApiError(
        'UNKNOWN_ERROR',
        undefined,
        'Não foi possível cadastrar o membro do comitê.',
      ),
    );
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

export const updateUserStatus = createAsyncThunk<
  UserListItem,
  UpdateUserStatusInput,
  { rejectValue: ApiError }
>('users/updateStatus', async (input, { rejectWithValue }) => {
  try {
    return await updateUserStatusRequest(input);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      return rejectWithValue(error as ApiError);
    }

    return rejectWithValue({
      message: 'Não foi possível alterar o status do usuário. Tente novamente.',
    });
  }
});

export const createUserAuthEvaluation = createAsyncThunk<
  UserAuthEvaluation,
  { userId: number } & UserAuthEvaluationInput,
  { rejectValue: ApiError }
>('users/createUserAuthEvaluation', async ({ userId, status, justification }, { rejectWithValue }) => {
  try {
    return await createUserAuthEvaluationRequest(userId, status, justification);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      return rejectWithValue(error as ApiError);
    }

    return rejectWithValue(normalizeUserApiError('UNKNOWN_ERROR', undefined));
  }
});
