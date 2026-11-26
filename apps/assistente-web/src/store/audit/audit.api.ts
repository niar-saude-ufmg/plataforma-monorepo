import { listAuditRequest } from '../../services/admin/admin.service';
import { createApiThunk } from '../utils/create-api-thunk';

export const getAudit = createApiThunk('audit/list', listAuditRequest, 'Falha ao carregar auditoria');
