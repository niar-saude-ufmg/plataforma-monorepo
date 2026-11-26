import { combineReducers, configureStore } from '@reduxjs/toolkit';
import auditReducer from './audit/audit.slice';
import cleaningReducer from './cleaning/cleaning.slice';
import datasetsReducer from './datasets/datasets.slice';
import projectsReducer from './projects/projects.slice';
import settingsReducer from './settings/settings.slice';
import usersReducer from './users/users.slice';
import { resetAssistantStore } from './session/session.actions';

const appReducer = combineReducers({
  projects: projectsReducer,
  cleaning: cleaningReducer,
  datasets: datasetsReducer,
  settings: settingsReducer,
  audit: auditReducer,
  users: usersReducer,
});

export const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: Parameters<typeof appReducer>[1]) => {
  if (resetAssistantStore.match(action)) return appReducer(undefined, action);
  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
