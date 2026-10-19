import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../types/user.types';
import type { MutationState } from '../../types/resource.types';

/**
 * Estado da sessão autenticada.
 *
 * A mutação é opcional para que o próximo card possa adicionar a edição do
 * perfil/troca de senha sem obrigar o fluxo de login a controlar esse estado
 * antes de ele existir.
 */
export type AuthState<MutationError = never, MutationOperation extends string = string> = {
  list?: never;
  selected: AuthUser | null;
  mutation?: MutationState<MutationError, MutationOperation>;
};

export const initialAuthState: AuthState = {
  selected: null,
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
  },
});

export const {
  setSelectedAuthUser,
  clearSelectedAuthUser,
} = authSlice.actions;
export default authSlice.reducer;
