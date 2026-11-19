import type { AssistantMessage, WizardSession } from '../../types/assistant.types';
import { request, requestFile } from '../http';

export const listProjectsRequest = () => request<WizardSession[]>('/projects');
export const createProjectRequest = (title: string) => request<WizardSession>('/projects', {
  method: 'POST', body: JSON.stringify({ wizard_type: 'project_doc', title }),
});
export const getProjectRequest = (id: number) => request<WizardSession>(`/projects/${id}`);
export const updateProjectRequest = (id: number, data: Record<string, unknown>) =>
  request<WizardSession>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const saveProjectDraftRequest = (id: number, data: Record<string, unknown>) =>
  request<WizardSession>(`/projects/${id}/save-draft`, { method: 'POST', body: JSON.stringify(data) });
export const importFullTextRequest = (id: number, fullText: string) =>
  request<WizardSession>(`/projects/${id}/import-text`, {
    method: 'POST', body: JSON.stringify({ full_text: fullText }),
  });
export const importDocxRequest = (id: number, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return request<WizardSession>(`/projects/${id}/import-docx`, { method: 'POST', body: form });
};
export const projectChatRequest = (id: number, content: string) =>
  request<AssistantMessage>(`/projects/${id}/chat`, { method: 'POST', body: JSON.stringify({ content }) });
export const advisoryChatRequest = (id: number, content: string) =>
  request<AssistantMessage>(`/projects/${id}/advisory-chat`, { method: 'POST', body: JSON.stringify({ content }) });
export const extractSectionRequest = (id: number, sectionKey: string) =>
  request<Record<string, unknown>>(`/projects/${id}/extract/${sectionKey}`, { method: 'POST' });
export const qualityCheckRequest = (id: number) => request<WizardSession['quality_checklist']>(
  `/projects/${id}/quality-check`, { method: 'POST' },
);
export const exportProjectRequest = (id: number) =>
  requestFile(`/projects/${id}/export`, { method: 'POST' }, 'project.docx');
export const submitForReviewRequest = (id: number) => requestFile(
  `/projects/${id}/submit-for-review`,
  { method: 'POST' },
  `projeto_submetido_${id}.docx`,
  'Não foi possível confirmar a submissão. Verifique o status do projeto antes de tentar novamente.',
);
export const getProjectCleaningRequest = (projectId: number) =>
  request<WizardSession>(`/projects/${projectId}/cleaning`);
export const createProjectCleaningRequest = (projectId: number) =>
  request<WizardSession>(`/projects/${projectId}/cleaning`, { method: 'POST' });
