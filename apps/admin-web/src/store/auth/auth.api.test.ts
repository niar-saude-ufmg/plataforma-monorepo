import { configureStore } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACCESS_TOKEN_STORAGE_KEY, SESSION_STORAGE_KEY } from '@niar/auth';
import { changePassword, updateProfile } from './auth.api';
import authReducer from './auth.slice';

const fetchMock = vi.hoisted(() => {
  const mock = vi.fn();
  globalThis.fetch = mock as typeof fetch;
  return mock;
});

const sessionResponse = {
  id: 7,
  email: 'pesquisador@niar.local',
  full_name: 'Pesquisador NIAR',
  role: 'researcher' as const,
  account_status: 'active' as const,
  profile: {
    phone: '(31) 98888-8888',
    institution: 'UFMG',
    organizational_unit: 'DCC',
    contact_address: 'Belo Horizonte - MG',
  },
};

function createTestStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

describe('auth api', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'token-de-teste');
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('passa por pending e succeeded ao atualizar o perfil', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => sessionResponse });
    const store = createTestStore();

    const promise = store.dispatch(updateProfile({ fullName: 'Pesquisador NIAR' }));
    expect(store.getState().auth.mutation).toEqual({
      operation: 'updateProfile',
      status: 'pending',
      error: null,
    });

    await promise;
    expect(store.getState().auth.mutation?.status).toBe('succeeded');
  });

  it('substitui o usuário selecionado com a sessão retornada', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => sessionResponse });
    const store = createTestStore();

    await store.dispatch(updateProfile({ fullName: 'Pesquisador NIAR' }));

    expect(store.getState().auth.selected).toMatchObject({
      id: 7,
      name: 'Pesquisador NIAR',
      profile: { phone: '(31) 98888-8888' },
    });
  });

  it('sincroniza a sessão persistida lida pela shell', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => sessionResponse });
    const store = createTestStore();

    await store.dispatch(updateProfile({ fullName: 'Pesquisador NIAR' }));

    const persisted = JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) ?? '{}');
    expect(persisted).toMatchObject({ id: 7, name: 'Pesquisador NIAR' });
  });

  it('vai para failed com o erro normalizado', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'E-mail já utilizado por outro usuário' }),
    });
    const store = createTestStore();

    await store.dispatch(updateProfile({ email: 'ocupado@niar.local' }));

    expect(store.getState().auth.mutation).toMatchObject({
      operation: 'updateProfile',
      status: 'failed',
      error: { status: 409 },
    });
  });

  it('identifica a operação changePassword na mesma mutation', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => sessionResponse });
    const store = createTestStore();

    await store.dispatch(
      changePassword({ currentPassword: 'senha-atual', password: 'nova-senha-123' }),
    );

    expect(store.getState().auth.mutation?.operation).toBe('changePassword');
    expect(store.getState().auth.mutation?.status).toBe('succeeded');
  });

  it('não envia password_confirmation no corpo da troca de senha', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => sessionResponse });
    const store = createTestStore();

    await store.dispatch(
      changePassword({ currentPassword: 'senha-atual', password: 'nova-senha-123' }),
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(Object.keys(body).sort()).toEqual(['current_password', 'password']);
  });

  it('não guarda nenhuma senha no estado', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => sessionResponse });
    const store = createTestStore();

    await store.dispatch(
      changePassword({ currentPassword: 'senha-atual', password: 'nova-senha-123' }),
    );

    const serialized = JSON.stringify(store.getState());
    expect(serialized).not.toContain('senha-atual');
    expect(serialized).not.toContain('nova-senha-123');
  });
});
