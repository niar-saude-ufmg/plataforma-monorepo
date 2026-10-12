import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/auth.slice';
import { adminApi } from './api/admin.api';
import usersReducer from './users/users.slice';
import projectsReducer from "./projects/projects.slice";
import './users/users.api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    projects: projectsReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
