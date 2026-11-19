import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type { CleaningVersion, WizardSession } from '../../types/assistant.types';
import { idleOperation } from '../../types/api.types';
import {
  createCleaning,
  generateCleaningScript,
  generateInitialCleaningScript,
  getCleaning,
  getCleaningList,
  getCleaningVersions,
  restoreCleaningVersion,
  saveCleaningVersion,
  sendCleaningChat,
  startCleaningKickoff,
  startNewCleaningVersion,
  updateCleaning,
  validateCleaningScript,
  exportCleaning,
  exportCleaningVersion,
} from './cleaning.api';

const sessionActions = [createCleaning.fulfilled, getCleaning.fulfilled, updateCleaning.fulfilled, restoreCleaningVersion.fulfilled, startNewCleaningVersion.fulfilled] as const;
const operationThunks = [createCleaning, getCleaning, updateCleaning, sendCleaningChat, startCleaningKickoff,
  generateInitialCleaningScript, generateCleaningScript, validateCleaningScript, getCleaningVersions,
  saveCleaningVersion, startNewCleaningVersion, restoreCleaningVersion, exportCleaning, exportCleaningVersion] as const;

type CleaningState = {
  items: WizardSession[];
  selected: WizardSession | null;
  versions: CleaningVersion[];
  list: ReturnType<typeof idleOperation>;
  operation: ReturnType<typeof idleOperation>;
};
const initialState: CleaningState = { items: [], selected: null, versions: [], list: idleOperation(), operation: idleOperation() };

const cleaningSlice = createSlice({
  name: 'cleaning',
  initialState,
  reducers: {
    setSelectedCleaning(state, action: PayloadAction<WizardSession | null>) { state.selected = action.payload; },
    clearCleaningError(state) { state.list.error = null; state.operation.error = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(getCleaningList.pending, (state) => { state.list = { status: 'pending', error: null, operation: 'list' }; });
    builder.addCase(getCleaningList.fulfilled, (state, action) => { state.items = action.payload; state.list = { status: 'succeeded', error: null, operation: 'list' }; });
    builder.addCase(getCleaningList.rejected, (state, action) => { state.list = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao carregar limpezas' }, operation: 'list' }; });
    builder.addCase(getCleaningVersions.fulfilled, (state, action) => { state.versions = action.payload; });
    builder.addMatcher(isAnyOf(...sessionActions), (state, action) => { state.selected = action.payload; });
    builder.addMatcher(isAnyOf(...operationThunks.map((thunk) => thunk.pending)), (state, action) => { state.operation = { status: 'pending', error: null, operation: action.type }; });
    builder.addMatcher(isAnyOf(...operationThunks.map((thunk) => thunk.fulfilled)), (state, action) => { state.operation = { status: 'succeeded', error: null, operation: action.type }; });
    builder.addMatcher(isAnyOf(...operationThunks.map((thunk) => thunk.rejected)), (state, action) => {
      state.operation = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha na operação' }, operation: action.type };
    });
  },
});
export const { setSelectedCleaning, clearCleaningError } = cleaningSlice.actions;
export default cleaningSlice.reducer;
