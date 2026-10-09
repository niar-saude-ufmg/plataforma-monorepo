// store/projects/projects.selectors.ts
import type { ProjectsState } from "./projects.slice";

type RootSlice = { projects: ProjectsState };

export const selectProjects = (state: RootSlice) => state.projects.projects;
export const selectSelectedProject = (state: RootSlice) => state.projects.selectedProject;
export const selectPagination = (state: RootSlice) => state.projects.pagination;
export const selectError = (state: RootSlice) => state.projects.error;
export const selectIsLoading = (state: RootSlice) => state.projects.status === "pending";
export const selectHasProjects = (state: RootSlice) => state.projects.projects.length > 0;
