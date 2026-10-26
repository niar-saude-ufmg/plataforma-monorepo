import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthApiError, AuthUser } from '../../types/user.types';
import type { MutationState } from '../../types/resource.types';
import { changePassword, updateProfile } from './auth.api';

/** Operações do próprio usuário sobre a própria sessão. */
export type AuthMutationOperation = 'updateProfile' | 'changePassword';

/**
 * Estado da sessão autenticada.
 *
 * A mutação é opcional para que o fluxo de login não precise controlar esse
 * estado; a edição de perfil e a troca de senha preenchem a operação.
 */
export type AuthState<
  MutationError = AuthApiError,
  MutationOperation extends string = AuthMutationOperation,
> = {
  list?: never;
  selected: AuthUser | null;
  mutation?: MutationState<MutationError, MutationOperation>;
};

const idleMutation: MutationState<AuthApiError, AuthMutationOperation> = {
  operation: null,
  status: 'idle',
  error: null,
};

export const initialAuthState: AuthState = {
  selected: null,
  mutation: idleMutation,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setSelectedAuthUser(state, action: PayloadAction<AuthUser | null>) {
      state.selected = action.payload;
    },
    clearSelectedAuthUser(state) {
      state.selected = null;
    },
    clearAuthMutation(state) {
      state.mutation = idleMutation;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateProfile.pending, (state) => {
      state.mutation = { operation: 'updateProfile', status: 'pending', error: null };
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.selected = action.payload;
      state.mutation = { operation: 'updateProfile', status: 'succeeded', error: null };
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.mutation = {
        operation: 'updateProfile',
        status: 'failed',
        error: action.payload ?? { message: 'Não foi possível salvar o perfil. Tente novamente.' },
      };
    });
    builder.addCase(changePassword.pending, (state) => {
      state.mutation = { operation: 'changePassword', status: 'pending', error: null };
    });
    builder.addCase(changePassword.fulfilled, (state, action) => {
      state.selected = action.payload;
      state.mutation = { operation: 'changePassword', status: 'succeeded', error: null };
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.mutation = {
        operation: 'changePassword',
        status: 'failed',
        error: action.payload ?? { message: 'Não foi possível trocar a senha. Tente novamente.' },
      };
    });
  },
});

export const {
  setSelectedAuthUser,
  clearSelectedAuthUser,
  clearAuthMutation,
} = authSlice.actions;
export default authSlice.reducer;
