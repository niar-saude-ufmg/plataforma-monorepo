import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../types/user.types';

type AuthState = {
  user: AuthUser | null;
};

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    clearAuthUser(state) {
      state.user = null;
    },
  },
});

export const { setAuthUser, clearAuthUser } = authSlice.actions;
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export default authSlice.reducer;
