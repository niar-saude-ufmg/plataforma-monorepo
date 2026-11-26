import { listSettingsRequest, updateSettingRequest } from '../../services/admin/admin.service';
import { createApiThunk } from '../utils/create-api-thunk';

export const getSettings = createApiThunk('settings/list', listSettingsRequest, 'Falha ao carregar configurações');
export const updateSetting = createApiThunk(
  'settings/update',
  ({ key, value }: { key: string; value: string }) => updateSettingRequest(key, value),
  'Falha ao atualizar configuração',
);
