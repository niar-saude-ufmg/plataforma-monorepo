import { describe, expect, it } from 'vitest';
import reducer, {
  clearUsersError,
  clearUsersState,
  setSelectedUser,
} from './users.slice';
import { selectUsersError } from './users.selectors';
import type { UserListItem } from '../../types/user.types';

const user: UserListItem = {
  id: 3,
  fullName: 'Ana Beatriz Souza',
  email: 'ana.souza@niar-saude.org',
  role: 'researcher' as const,
  createdAt: '2026-08-31T12:00:00.000Z',
  accountStatus: 'pending',
  profile: null,
  researcherProfile: null,
  committeeProfile: null,
  coep: null,
  latestAuthEvaluation: null,
};

describe('usersSlice', () => {
  it('armazena o usuário selecionado', () => {
    const state = reducer(undefined, setSelectedUser(user));

    expect(state).toEqual({
      users: [],
      selectedUser: user,
      pagination: null,
      filters: {},
      page: 1,
      pageSize: 20,
      status: 'idle',
      error: null,
    });
  });

  it('limpa o estado local de usuários', () => {
    expect(reducer({
      users: [user],
      selectedUser: user,
      pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      filters: { role: 'researcher' },
      page: 2,
      pageSize: 10,
      status: 'failed',
      error: { message: 'Falha' },
    }, clearUsersState())).toEqual({
      users: [],
      selectedUser: null,
      pagination: null,
      filters: {},
      page: 1,
      pageSize: 20,
      status: 'idle',
      error: null,
    });
  });

  it('expõe null no seletor quando não há erro', () => {
    const state = reducer(undefined, { type: 'unknown' });

    expect(selectUsersError({ users: state })).toBeNull();
  });

  it('limpa apenas o erro da API depois que o snackbar fecha', () => {
    expect(reducer({
      users: [user],
      selectedUser: user,
      pagination: null,
      filters: {},
      page: 1,
      pageSize: 20,
      status: 'failed',
      error: { message: 'Falha' },
    }, clearUsersError())).toEqual({
      users: [user],
      selectedUser: user,
      pagination: null,
      filters: {},
      page: 1,
      pageSize: 20,
      status: 'idle',
      error: null,
    });
  });
});
