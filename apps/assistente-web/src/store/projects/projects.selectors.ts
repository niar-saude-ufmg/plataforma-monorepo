import type { RootState } from '..';
export const selectProjects = (state: RootState) => state.projects.items;
export const selectCurrentProject = (state: RootState) => state.projects.selected;
export const selectLinkedCleaning = (state: RootState) => state.projects.linkedCleaning;
export const selectProjectsLoading = (state: RootState) => state.projects.list.status === 'pending';
export const selectProjectsError = (state: RootState) => state.projects.list.error;
export const selectProjectOperation = (state: RootState) => state.projects.operation;
