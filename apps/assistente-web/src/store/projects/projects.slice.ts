import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type { WizardSession } from '../../types/assistant.types';
import { idleOperation } from '../../types/api.types';
import {
  createProject,
  createProjectCleaning,
  exportProject,
  getProject,
  getProjectCleaning,
  getProjects,
  importProjectDocx,
  importProjectText,
  runProjectQualityCheck,
  saveProjectDraft,
  sendAdvisoryChat,
  sendProjectChat,
  submitProjectForReview,
  updateProject,
  extractProjectSection,
} from './projects.api';

const sessionActions = [
  createProject.fulfilled,
  getProject.fulfilled,
  updateProject.fulfilled,
  saveProjectDraft.fulfilled,
  importProjectText.fulfilled,
  importProjectDocx.fulfilled,
] as const;

const operationThunks = [
  createProject, getProject, updateProject, saveProjectDraft, importProjectText, importProjectDocx,
  sendProjectChat, sendAdvisoryChat, extractProjectSection, runProjectQualityCheck,
  getProjectCleaning, createProjectCleaning, exportProject, submitProjectForReview,
] as const;

export type ProjectsState = {
  items: WizardSession[];
  selected: WizardSession | null;
  linkedCleaning: WizardSession | null;
  list: ReturnType<typeof idleOperation>;
  operation: ReturnType<typeof idleOperation>;
};

const initialState: ProjectsState = {
  items: [], selected: null, linkedCleaning: null, list: idleOperation(), operation: idleOperation(),
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProject(state, action: PayloadAction<WizardSession | null>) { state.selected = action.payload; },
    setLinkedCleaning(state, action: PayloadAction<WizardSession | null>) { state.linkedCleaning = action.payload; },
    clearProjectsError(state) { state.list.error = null; state.operation.error = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(getProjects.pending, (state) => { state.list = { status: 'pending', error: null, operation: 'list' }; });
    builder.addCase(getProjects.fulfilled, (state, action) => {
      state.items = action.payload;
      state.list = { status: 'succeeded', error: null, operation: 'list' };
    });
    builder.addCase(getProjects.rejected, (state, action) => {
      state.list = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao carregar projetos' }, operation: 'list' };
    });
    builder.addMatcher(isAnyOf(...sessionActions), (state, action) => { state.selected = action.payload; });
    builder.addMatcher(isAnyOf(getProjectCleaning.fulfilled, createProjectCleaning.fulfilled), (state, action) => {
      state.linkedCleaning = action.payload;
    });
    builder.addMatcher(isAnyOf(...operationThunks.map((thunk) => thunk.pending)), (state, action) => {
      state.operation = { status: 'pending', error: null, operation: action.type };
    });
    builder.addMatcher(isAnyOf(...operationThunks.map((thunk) => thunk.fulfilled)), (state, action) => {
      state.operation = { status: 'succeeded', error: null, operation: action.type };
    });
    builder.addMatcher(isAnyOf(...operationThunks.map((thunk) => thunk.rejected)), (state, action) => {
      state.operation = {
        status: 'failed',
        error: action.payload ?? { message: action.error.message || 'Falha na operação' },
        operation: action.type,
      };
    });
  },
});

export const { setSelectedProject, setLinkedCleaning, clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
