import { describe, expect, it } from 'vitest';
import reducer, {
  clearAuthMutation,
  clearSelectedAuthUser,
  initialAuthState,
  setSelectedAuthUser,
} from './auth.slice';
import { changePassword, updateProfile } from './auth.api';
import {
  selectAuthMutationError,
  selectAuthMutationOperation,
  selectAuthMutationStatus,
  selectAuthSelected,
} from './auth.selectors';

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

    expect(state.selected).toEqual(user);
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
    const state = reducer({ ...initialAuthState, selected: user }, clearSelectedAuthUser());

    expect(state.selected).toBeNull();
  });

  it('começa com a mutation ociosa', () => {
    expect(reducer(undefined, { type: 'unknown' }).mutation).toEqual({
      operation: null,
      status: 'idle',
      error: null,
    });
  });

  it('marca a operação updateProfile em pending', () => {
    const state = reducer(undefined, { type: updateProfile.pending.type });

    expect(state.mutation).toEqual({ operation: 'updateProfile', status: 'pending', error: null });
  });

  it('substitui o usuário selecionado quando o perfil é atualizado', () => {
    const atualizado = { ...user, name: 'Nome Novo' };
    const state = reducer(
      { ...initialAuthState, selected: user },
      { type: updateProfile.fulfilled.type, payload: atualizado },
    );

    expect(state.selected).toEqual(atualizado);
    expect(state.mutation).toEqual({ operation: 'updateProfile', status: 'succeeded', error: null });
  });

  it('guarda o erro normalizado quando a atualização falha', () => {
    const state = reducer(undefined, {
      type: updateProfile.rejected.type,
      payload: { status: 409, message: 'Este e-mail já está em uso por outro usuário.' },
    });

    expect(state.mutation?.status).toBe('failed');
    expect(state.mutation?.operation).toBe('updateProfile');
    expect(state.mutation?.error?.message).toBe('Este e-mail já está em uso por outro usuário.');
  });

  it('distingue changePassword de updateProfile na mesma mutation', () => {
    const state = reducer(undefined, { type: changePassword.pending.type });

    expect(state.mutation?.operation).toBe('changePassword');
    expect(state.mutation?.status).toBe('pending');
  });

  it('também substitui a sessão depois da troca de senha', () => {
    const state = reducer(
      { ...initialAuthState, selected: null },
      { type: changePassword.fulfilled.type, payload: user },
    );

    expect(state.selected).toEqual(user);
    expect(state.mutation?.operation).toBe('changePassword');
  });

  it('volta a mutation para ociosa quando limpa', () => {
    const comErro = reducer(undefined, {
      type: changePassword.rejected.type,
      payload: { status: 400, message: 'Senha atual incorreta.' },
    });

    expect(reducer(comErro, clearAuthMutation()).mutation).toEqual({
      operation: null,
      status: 'idle',
      error: null,
    });
  });

  it('expõe status, operação e erro da mutation pelos selectors', () => {
    const auth = reducer(undefined, {
      type: updateProfile.rejected.type,
      payload: { status: 400, message: 'Revise os campos informados.' },
    });

    expect(selectAuthMutationStatus({ auth })).toBe('failed');
    expect(selectAuthMutationOperation({ auth })).toBe('updateProfile');
    expect(selectAuthMutationError({ auth })?.message).toBe('Revise os campos informados.');
  });

  it('expõe o usuário selecionado pelo selector', () => {
    const state = { auth: reducer(undefined, setSelectedAuthUser(user)) };

    expect(selectAuthSelected(state)).toEqual(user);
  });
});
