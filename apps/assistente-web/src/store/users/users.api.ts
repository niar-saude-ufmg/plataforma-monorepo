import { createUserRequest, listUsersRequest } from '../../services/admin/admin.service';
import { createApiThunk } from '../create-api-thunk';

export const getUsers = createApiThunk('users/list', listUsersRequest, 'Falha ao carregar usuários');
export const createUser = createApiThunk('users/create', createUserRequest, 'Falha ao criar usuário');
