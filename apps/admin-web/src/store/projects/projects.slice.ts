import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Project,
  Pagination,
} from "../../types/project.types";
import type { ApiError } from "../../types/api.types";
import { getProjects, getProject } from "./projects.api";

export type ProjectsStatus = "idle" | "pending" | "succeeded" | "failed";

export type ProjectsState = {
  projects: Project[];
  selectedProject: Project | null;
  pagination: Pagination | null;
  status: ProjectsStatus;
  error: ApiError | null;
};

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  pagination: null,
  status: "idle",
  error: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setSelectedProject(state, action: PayloadAction<Project | null>) {
      state.selectedProject = action.payload;
    },
    clearSelectedProject(state) {
      state.selectedProject = null;
    },
    clearProjectsState(state) {
      state.projects = [];
      state.selectedProject = null;
      state.pagination = null;
      state.status = "idle";
      state.error = null;
    },
    clearProjectsError(state) {
      state.error = null;
      if (state.status === "failed") {
        state.status = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    // ---------- getProjects ----------
    builder.addCase(getProjects.pending, (state) => {
      state.status = "pending";
      state.error = null;
    });
    builder.addCase(getProjects.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      state.projects = action.payload.items;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getProjects.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload ?? {
        message: "Não foi possível carregar os projetos. Tente novamente.",
      };
    });

    // ---------- getProject ----------
    builder.addCase(getProject.pending, (state) => {
      state.status = "pending";
      state.error = null;
    });
    builder.addCase(getProject.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      state.selectedProject = action.payload;
    });
    builder.addCase(getProject.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload ?? {
        message: "Não foi possível carregar o projeto. Tente novamente.",
      };
    });
  },
});

export const {
  setSelectedProject,
  clearSelectedProject,
  clearProjectsState,
  clearProjectsError,
} = projectsSlice.actions;

export default projectsSlice.reducer;
