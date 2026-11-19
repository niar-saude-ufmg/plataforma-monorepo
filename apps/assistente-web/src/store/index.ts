import { configureStore } from '@reduxjs/toolkit';
import auditReducer from './audit/audit.slice';
import cleaningReducer from './cleaning/cleaning.slice';
import datasetsReducer from './datasets/datasets.slice';
import projectsReducer from './projects/projects.slice';
import settingsReducer from './settings/settings.slice';
import usersReducer from './users/users.slice';

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    cleaning: cleaningReducer,
    datasets: datasetsReducer,
    settings: settingsReducer,
    audit: auditReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
