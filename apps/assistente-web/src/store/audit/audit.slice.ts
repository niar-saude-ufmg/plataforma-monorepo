import { createSlice } from '@reduxjs/toolkit';
import type { AuditEntry } from '../../types/assistant.types';
import { idleOperation } from '../../types/api.types';
import { getAudit } from './audit.api';
type AuditState = { items: AuditEntry[]; load: ReturnType<typeof idleOperation> };
const initialState: AuditState = { items: [], load: idleOperation() };
const auditSlice = createSlice({ name: 'audit', initialState, reducers: {}, extraReducers: (builder) => {
  builder.addCase(getAudit.pending, (state) => { state.load = { status: 'pending', error: null, operation: 'list' }; });
  builder.addCase(getAudit.fulfilled, (state, action) => { state.items = action.payload; state.load = { status: 'succeeded', error: null, operation: 'list' }; });
  builder.addCase(getAudit.rejected, (state, action) => { state.load = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao carregar auditoria' }, operation: 'list' }; });
} });
export default auditSlice.reducer;
