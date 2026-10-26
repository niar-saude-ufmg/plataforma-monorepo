import type { AuthState } from './auth.slice';

export type AuthRootState = {
  auth: AuthState;
};

const selectAuthState = (state: AuthRootState) => state.auth;

export const selectAuthSelected = (state: AuthRootState) => selectAuthState(state).selected;
export const selectAuthMutation = (state: AuthRootState) => selectAuthState(state).mutation;
export const selectAuthMutationStatus = (state: AuthRootState) =>
  selectAuthState(state).mutation?.status ?? 'idle';
export const selectAuthMutationOperation = (state: AuthRootState) =>
  selectAuthState(state).mutation?.operation ?? null;
export const selectAuthMutationError = (state: AuthRootState) =>
  selectAuthState(state).mutation?.error ?? null;
export const selectAuthMutationLoading = (state: AuthRootState) =>
  selectAuthState(state).mutation?.status === 'pending';
