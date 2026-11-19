import { createSlice } from '@reduxjs/toolkit';
import type { Setting } from '../../types/assistant.types';
import { idleOperation } from '../../types/api.types';
import { getSettings, updateSetting } from './settings.api';

type SettingsState = { items: Setting[]; load: ReturnType<typeof idleOperation>; mutation: ReturnType<typeof idleOperation> };
const initialState: SettingsState = { items: [], load: idleOperation(), mutation: idleOperation() };
const settingsSlice = createSlice({ name: 'settings', initialState, reducers: {}, extraReducers: (builder) => {
  builder.addCase(getSettings.pending, (state) => { state.load = { status: 'pending', error: null, operation: 'list' }; });
  builder.addCase(getSettings.fulfilled, (state, action) => { state.items = action.payload; state.load = { status: 'succeeded', error: null, operation: 'list' }; });
  builder.addCase(getSettings.rejected, (state, action) => { state.load = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao carregar configurações' }, operation: 'list' }; });
  builder.addCase(updateSetting.pending, (state) => { state.mutation = { status: 'pending', error: null, operation: 'update' }; });
  builder.addCase(updateSetting.fulfilled, (state) => { state.mutation = { status: 'succeeded', error: null, operation: 'update' }; });
  builder.addCase(updateSetting.rejected, (state, action) => { state.mutation = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao salvar configuração' }, operation: 'update' }; });
} });
export default settingsSlice.reducer;
