import type { ProjectsState } from "./projects.slice";

type RootSlice = { projects: ProjectsState };

export const selectProjects = (state: RootSlice) => state.projects.projects;
export const selectSelectedProject = (state: RootSlice) => state.projects.selectedProject;
export const selectProjectsPagination = (state: RootSlice) => state.projects.pagination;
export const selectProjectsFilters = (state: RootSlice) => state.projects.filters;
export const selectProjectsPage = (state: RootSlice) => state.projects.page;
export const selectProjectsPageSize = (state: RootSlice) => state.projects.pageSize;
export const selectProjectsStatus = (state: RootSlice) => state.projects.status;
export const selectProjectsError = (state: RootSlice) => state.projects.error;
export const selectProjectsLoading = (state: RootSlice) => state.projects.status === "pending";
export const selectProjectsHasItems = (state: RootSlice) => state.projects.projects.length > 0;
