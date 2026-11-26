import {
  cleaningChatRequest,
  cleaningKickoffRequest,
  createCleaningRequest,
  exportCleaningRequest,
  exportCleaningVersionRequest,
  generateInitialScriptRequest,
  generateScriptRequest,
  getCleaningRequest,
  listCleaningRequest,
  listCleaningVersionsRequest,
  restoreCleaningVersionRequest,
  saveCleaningVersionRequest,
  startNewCleaningVersionRequest,
  updateCleaningRequest,
  validateScriptRequest,
} from '../../services/cleaning/cleaning.service';
import { downloadFile } from '../../services/http';
import { createApiThunk } from '../utils/create-api-thunk';

export const getCleaningList = createApiThunk('cleaning/list', listCleaningRequest, 'Falha ao carregar limpezas');
export const createCleaning = createApiThunk('cleaning/create', createCleaningRequest, 'Falha ao criar limpeza');
export const getCleaning = createApiThunk('cleaning/get', getCleaningRequest, 'Falha ao carregar limpeza');
export const updateCleaning = createApiThunk(
  'cleaning/update',
  ({ id, data }: { id: number; data: Record<string, unknown> }) => updateCleaningRequest(id, data),
  'Falha ao atualizar limpeza',
);
export const sendCleaningChat = createApiThunk(
  'cleaning/chat',
  ({ id, content }: { id: number; content: string }) => cleaningChatRequest(id, content),
  'Falha ao enviar mensagem',
);
export const startCleaningKickoff = createApiThunk(
  'cleaning/kickoff', cleaningKickoffRequest, 'Falha ao iniciar planejamento',
);
export const generateInitialCleaningScript = createApiThunk(
  'cleaning/initialScript', generateInitialScriptRequest, 'Falha ao gerar script inicial',
);
export const generateCleaningScript = createApiThunk(
  'cleaning/generateScript', generateScriptRequest, 'Falha ao gerar script',
);
export const validateCleaningScript = createApiThunk(
  'cleaning/validate', validateScriptRequest, 'Falha na validação',
);
export const getCleaningVersions = createApiThunk(
  'cleaning/versions', listCleaningVersionsRequest, 'Falha ao carregar versões',
);
export const saveCleaningVersion = createApiThunk(
  'cleaning/saveVersion',
  ({ id, data }: { id: number; data: { label?: string; notes?: string } }) => saveCleaningVersionRequest(id, data),
  'Falha ao salvar versão',
);
export const startNewCleaningVersion = createApiThunk(
  'cleaning/newVersion',
  ({ id, data }: { id: number; data: { save_current?: boolean; current_label?: string; notes?: string } }) =>
    startNewCleaningVersionRequest(id, data),
  'Falha ao iniciar versão',
);
export const restoreCleaningVersion = createApiThunk(
  'cleaning/restoreVersion',
  ({ id, versionId }: { id: number; versionId: number }) => restoreCleaningVersionRequest(id, versionId),
  'Falha ao restaurar versão',
);
export const exportCleaningVersion = createApiThunk(
  'cleaning/exportVersion',
  async ({ id, versionId }: { id: number; versionId: number }) => {
    const file = await exportCleaningVersionRequest(id, versionId);
    downloadFile(file);
    return { filename: file.filename };
  },
  'Falha na exportação',
);
export const exportCleaning = createApiThunk('cleaning/export', async (id: number) => {
  const file = await exportCleaningRequest(id);
  downloadFile(file);
  return { filename: file.filename };
}, 'Falha na exportação');
