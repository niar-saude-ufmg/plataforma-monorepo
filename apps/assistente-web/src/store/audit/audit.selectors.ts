import type { RootState } from '..';
export const selectAudit = (state: RootState) => state.audit.items;
export const selectAuditLoad = (state: RootState) => state.audit.load;
