import type { AuthState } from './auth.slice';

export type AuthRootState = {
  auth: AuthState;
};

const selectAuthState = (state: AuthRootState) => state.auth;

export const selectAuthSelected = (state: AuthRootState) => selectAuthState(state).selected;
