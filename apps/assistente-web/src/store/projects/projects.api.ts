import {
  advisoryChatRequest,
  createProjectCleaningRequest,
  createProjectRequest,
  extractSectionRequest,
  getProjectCleaningRequest,
  getProjectRequest,
  importDocxRequest,
  importFullTextRequest,
  listProjectsRequest,
  projectChatRequest,
  qualityCheckRequest,
  saveProjectDraftRequest,
  updateProjectRequest,
  exportProjectRequest,
  submitForReviewRequest,
} from '../../services/projects/projects.service';
import { downloadFile } from '../../services/http';
import { createApiThunk } from '../create-api-thunk';

export const getProjects = createApiThunk('projects/list', listProjectsRequest, 'Falha ao carregar projetos');
export const createProject = createApiThunk('projects/create', createProjectRequest, 'Falha ao criar projeto');
export const getProject = createApiThunk('projects/get', getProjectRequest, 'Falha ao carregar projeto');
export const updateProject = createApiThunk(
  'projects/update',
  ({ id, data }: { id: number; data: Record<string, unknown> }) => updateProjectRequest(id, data),
  'Falha ao atualizar projeto',
);
export const saveProjectDraft = createApiThunk(
  'projects/saveDraft',
  ({ id, data }: { id: number; data: Record<string, unknown> }) => saveProjectDraftRequest(id, data),
  'Falha ao salvar rascunho',
);
export const importProjectText = createApiThunk(
  'projects/importText',
  ({ id, fullText }: { id: number; fullText: string }) => importFullTextRequest(id, fullText),
  'Falha ao importar texto',
);
export const importProjectDocx = createApiThunk(
  'projects/importDocx',
  ({ id, file }: { id: number; file: File }) => importDocxRequest(id, file),
  'Falha ao importar documento',
);
export const sendProjectChat = createApiThunk(
  'projects/chat',
  ({ id, content }: { id: number; content: string }) => projectChatRequest(id, content),
  'Falha ao enviar mensagem',
);
export const sendAdvisoryChat = createApiThunk(
  'projects/advisoryChat',
  ({ id, content }: { id: number; content: string }) => advisoryChatRequest(id, content),
  'Falha ao enviar mensagem',
);
export const extractProjectSection = createApiThunk(
  'projects/extractSection',
  ({ id, sectionKey }: { id: number; sectionKey: string }) => extractSectionRequest(id, sectionKey),
  'Falha ao gerar texto da seção',
);
export const runProjectQualityCheck = createApiThunk(
  'projects/qualityCheck', qualityCheckRequest, 'Falha na revisão do projeto',
);
export const getProjectCleaning = createApiThunk(
  'projects/getCleaning', getProjectCleaningRequest, 'Falha ao carregar engenharia de dados vinculada',
);
export const createProjectCleaning = createApiThunk(
  'projects/createCleaning', createProjectCleaningRequest, 'Falha ao iniciar engenharia de dados',
);
export const exportProject = createApiThunk('projects/export', async (id: number) => {
  const file = await exportProjectRequest(id);
  downloadFile(file);
  return { filename: file.filename };
}, 'Falha na exportação');
export const submitProjectForReview = createApiThunk('projects/submitForReview', async (id: number) => {
  const file = await submitForReviewRequest(id);
  downloadFile(file);
  return { filename: file.filename };
}, 'Falha na submissão');
