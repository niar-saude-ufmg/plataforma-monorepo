import { describe, expect, it } from 'vitest';
import reducer, { clearAuthUser, setAuthUser } from './auth.slice';

const user = {
  id: 4,
  name: 'Pesquisador NIAR',
  email: 'pesquisador@niar.local',
  role: 'researcher' as const,
};

describe('authSlice', () => {
  it('armazena o usuário autenticado', () => {
    expect(reducer(undefined, setAuthUser(user))).toEqual({ user });
  });

  it('limpa o usuário autenticado', () => {
    expect(reducer({ user }, clearAuthUser())).toEqual({ user: null });
  });
});
