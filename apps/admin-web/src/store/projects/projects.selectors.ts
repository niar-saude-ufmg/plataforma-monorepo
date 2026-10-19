import type { ProjectsState } from "./projects.slice";

export type ProjectsRootState = {
  projects: ProjectsState;
};

const selectProjectsState = (state: ProjectsRootState) => state.projects;

export const selectProjectsList = (state: ProjectsRootState) => selectProjectsState(state).list.items;
export const selectProjectsSelected = (state: ProjectsRootState) => selectProjectsState(state).selected;
export const selectProjectsListPagination = (state: ProjectsRootState) => selectProjectsState(state).list.pagination;
export const selectProjectsListFilters = (state: ProjectsRootState) => selectProjectsState(state).list.filters;
export const selectProjectsListPage = (state: ProjectsRootState) => selectProjectsState(state).list.page;
export const selectProjectsListPageSize = (state: ProjectsRootState) => selectProjectsState(state).list.pageSize;
export const selectProjectsListStatus = (state: ProjectsRootState) => selectProjectsState(state).list.status;
export const selectProjectsListError = (state: ProjectsRootState) => selectProjectsState(state).list.error;
export const selectProjectsListLoading = (state: ProjectsRootState) => selectProjectsState(state).list.status === "pending";
export const selectProjectsListHasItems = (state: ProjectsRootState) => selectProjectsState(state).list.items.length > 0;
