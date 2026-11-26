import type { AssistantMessage, CleaningVersion, WizardSession } from '../../types/assistant.types';
import { request, requestFile } from '../http';

export const listCleaningRequest = () => request<WizardSession[]>('/cleaning');
export const createCleaningRequest = (title: string) => request<WizardSession>('/cleaning', {
  method: 'POST', body: JSON.stringify({ wizard_type: 'data_clean', title }),
});
export const getCleaningRequest = (id: number) => request<WizardSession>(`/cleaning/${id}`);
export const updateCleaningRequest = (id: number, data: Record<string, unknown>) =>
  request<WizardSession>(`/cleaning/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const cleaningChatRequest = (id: number, content: string) =>
  request<AssistantMessage>(`/cleaning/${id}/chat`, { method: 'POST', body: JSON.stringify({ content }) });
export const cleaningKickoffRequest = (id: number) =>
  request<AssistantMessage>(`/cleaning/${id}/kickoff`, { method: 'POST' });
export const generateInitialScriptRequest = (id: number) => request<{
  script_content: string;
  validation_result: Record<string, unknown>;
  already_exists?: boolean;
}>(`/cleaning/${id}/initial-script`, { method: 'POST' });
export const generateScriptRequest = (id: number) => request<{
  script_content: string;
  validation_result: Record<string, unknown>;
}>(`/cleaning/${id}/generate-script`, { method: 'POST' });
export const validateScriptRequest = (id: number) =>
  request<Record<string, unknown>>(`/cleaning/${id}/validate`, { method: 'POST' });
export const listCleaningVersionsRequest = (id: number) =>
  request<CleaningVersion[]>(`/cleaning/${id}/versions`);
export const saveCleaningVersionRequest = (id: number, data: { label?: string; notes?: string }) =>
  request<void>(`/cleaning/${id}/versions`, { method: 'POST', body: JSON.stringify(data) });
export const startNewCleaningVersionRequest = (
  id: number,
  data: { save_current?: boolean; current_label?: string; notes?: string },
) => request<WizardSession>(`/cleaning/${id}/versions/new`, {
  method: 'POST', body: JSON.stringify(data),
});
export const restoreCleaningVersionRequest = (id: number, versionId: number) =>
  request<WizardSession>(`/cleaning/${id}/versions/${versionId}/restore`, { method: 'POST' });
export const exportCleaningVersionRequest = (id: number, versionId: number) => requestFile(
  `/cleaning/${id}/versions/${versionId}/export`, { method: 'POST' }, `data_clean_v${versionId}.py`,
);
export const exportCleaningRequest = (id: number) =>
  requestFile(`/cleaning/${id}/export`, { method: 'POST' }, 'data_clean.py');
