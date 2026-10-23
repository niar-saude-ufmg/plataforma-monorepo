import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/auth.slice';
import specialtiesReducer from './specialties/specialties.slice';
import usersReducer from './users/users.slice';
import projectsReducer from "./projects/projects.slice";
import './users/users.api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    specialties: specialtiesReducer,
    users: usersReducer,
    projects: projectsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
