import { describe, expect, it } from 'vitest';
import reducer, { clearAuthUser, setAuthUser } from './auth.slice';

const user = {
  id: 4,
  name: 'Pesquisador NIAR',
  email: 'pesquisador@niar.local',
  role: 'researcher' as const,
  accountStatus: 'active' as const,
  profile: {
    phone: '(31) 99999-9999',
    institution: 'UFMG',
    organizationalUnit: 'DCC',
    contactAddress: 'Belo Horizonte - MG',
  },
  researcherProfile: {
    researchArea: 'Saúde pública',
    position: 'Professor',
  },
  coep: {
    caae: '12345678.9.0000.0000',
    opinionNumber: '1234.567',
    approvalDate: '2026-09-25',
    documentFilename: 'parecer-coep.pdf',
  },
};

describe('authSlice', () => {
  it('armazena o usuário autenticado', () => {
    expect(reducer(undefined, setAuthUser(user))).toEqual({ user });
  });

  it('preserva os dados específicos do perfil autenticado', () => {
    const state = reducer(undefined, setAuthUser(user));

    expect(state.user?.profile?.phone).toBe('(31) 99999-9999');
    expect(state.user?.researcherProfile?.researchArea).toBe('Saúde pública');
    expect(state.user?.coep?.documentFilename).toBe('parecer-coep.pdf');
  });

  it('limpa o usuário autenticado', () => {
    expect(reducer({ user }, clearAuthUser())).toEqual({ user: null });
  });
});
