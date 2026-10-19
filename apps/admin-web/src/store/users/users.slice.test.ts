import { describe, expect, it } from 'vitest';
import reducer, {
  clearUsersError,
  clearUsersState,
  setSelectedUser,
} from './users.slice';
import { selectUsersListError } from './users.selectors';
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
      list: {
        items: [],
        pagination: null,
        filters: {},
        page: 1,
        pageSize: 20,
        status: 'idle',
        error: null,
      },
      selected: user,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    });
  });

  it('limpa o estado local de usuários', () => {
    expect(reducer({
      list: {
        items: [user],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
        filters: { role: 'researcher' },
        page: 2,
        pageSize: 20,
        status: 'failed',
        error: { message: 'Falha' },
      },
      selected: user,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    }, clearUsersState())).toEqual({
      list: {
        items: [],
        pagination: null,
        filters: {},
        page: 1,
        pageSize: 20,
        status: 'idle',
        error: null,
      },
      selected: null,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    });
  });

  it('expõe null no seletor quando não há erro', () => {
    const state = reducer(undefined, { type: 'unknown' });

    expect(selectUsersListError({ users: state })).toBeNull();
  });

  it('limpa apenas o erro da API depois que o snackbar fecha', () => {
    expect(reducer({
      list: {
        items: [user],
        pagination: null,
        filters: {},
        page: 1,
        pageSize: 10,
        status: 'failed',
        error: { message: 'Falha' },
      },
      selected: user,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    }, clearUsersError())).toEqual({
      list: {
        items: [user],
        pagination: null,
        filters: {},
        page: 1,
        pageSize: 10,
        status: 'idle',
        error: null,
      },
      selected: user,
      mutation: { operation: null, status: 'idle', error: null },
      download: { status: 'idle', error: null, filename: null },
    });
  });
});
