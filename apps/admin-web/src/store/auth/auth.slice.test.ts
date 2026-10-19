import { describe, expect, it } from 'vitest';
import reducer, { clearSelectedAuthUser, initialAuthState, setSelectedAuthUser } from './auth.slice';
import { selectAuthSelected } from './auth.selectors';

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
  it('inicia sem usuário autenticado', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialAuthState);
  });

  it('armazena o usuário autenticado com os dados do perfil', () => {
    const state = reducer(undefined, setSelectedAuthUser(user));

    expect(state).toEqual({ selected: user });
    expect(state.selected?.profile?.phone).toBe('(31) 99999-9999');
    expect(state.selected?.researcherProfile?.researchArea).toBe('Saúde pública');
    expect(state.selected?.coep?.documentFilename).toBe('parecer-coep.pdf');
  });

  it('substitui o usuário quando a sessão retorna dados atualizados', () => {
    const updatedUser = {
      ...user,
      name: 'Pesquisador Atualizado',
      profile: { ...user.profile, phone: '(31) 98888-8888' },
    };
    const state = reducer(reducer(undefined, setSelectedAuthUser(user)), setSelectedAuthUser(updatedUser));

    expect(state.selected).toEqual(updatedUser);
  });

  it('limpa o usuário autenticado', () => {
    expect(reducer({ selected: user }, clearSelectedAuthUser())).toEqual(initialAuthState);
  });

  it('expõe o usuário selecionado pelo selector', () => {
    const state = { auth: reducer(undefined, setSelectedAuthUser(user)) };

    expect(selectAuthSelected(state)).toEqual(user);
  });
});
