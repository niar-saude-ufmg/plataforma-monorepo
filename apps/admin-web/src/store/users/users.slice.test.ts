import { describe, expect, it } from 'vitest';
import reducer, {
  clearUsersError,
  clearUsersState,
  selectError,
  setLastCreatedUser,
  setSelectedUser,
} from './users.slice';

const user = {
  id: 3,
  fullName: 'Ana Beatriz Souza',
  email: 'ana.souza@niar-saude.org',
  role: 'researcher' as const,
  createdAt: '2026-08-31T12:00:00.000Z',
};

describe('usersSlice', () => {
  it('armazena o usuário selecionado e o último usuário criado', () => {
    const selectedState = reducer(undefined, setSelectedUser(user));
    const state = reducer(selectedState, setLastCreatedUser(user));

    expect(state).toEqual({
      selectedUser: user,
      lastCreatedUser: user,
      status: 'idle',
      error: null,
    });
  });

  it('limpa o estado local de usuários', () => {
    expect(reducer({
      selectedUser: user,
      lastCreatedUser: user,
      status: 'failed',
      error: { message: 'Falha' },
    }, clearUsersState())).toEqual({
      selectedUser: null,
      lastCreatedUser: null,
      status: 'idle',
      error: null,
    });
  });

  it('expõe null no seletor quando não há erro', () => {
    const state = reducer(undefined, { type: 'unknown' });

    expect(selectError({ users: state })).toBeNull();
  });

  it('limpa apenas o erro da API depois que o snackbar fecha', () => {
    expect(reducer({
      selectedUser: user,
      lastCreatedUser: null,
      status: 'failed',
      error: { message: 'Falha' },
    }, clearUsersError())).toEqual({
      selectedUser: user,
      lastCreatedUser: null,
      status: 'idle',
      error: null,
    });
  });
});
