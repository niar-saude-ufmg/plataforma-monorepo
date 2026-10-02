import { describe, expect, it } from 'vitest';
import reducer, {
  clearUsersState,
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
    });
  });

  it('limpa o estado local de usuários', () => {
    expect(reducer({ selectedUser: user, lastCreatedUser: user }, clearUsersState())).toEqual({
      selectedUser: null,
      lastCreatedUser: null,
    });
  });
});
