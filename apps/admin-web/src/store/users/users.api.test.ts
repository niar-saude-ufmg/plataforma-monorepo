import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CreateUserInput } from '../../types/user.types';
import { createUser, getUsers } from './users.api';
import usersReducer from './users.slice';

const fetchMock = vi.hoisted(() => {
  const mock = vi.fn();
  globalThis.fetch = mock as typeof fetch;
  return mock;
});

const input: CreateUserInput = {
  fullName: 'Ana Beatriz Souza',
  email: 'ana.souza@niar-saude.org',
  password: 'senhaforte1',
  profile: {
    phone: '(31) 99999-9999',
    institution: 'UFMG',
    organizationalUnit: 'Faculdade de Medicina',
    contactAddress: 'Belo Horizonte - MG',
  },
  researcherProfile: {
    researchArea: 'Saúde pública',
    position: 'Professora',
  },
  coep: {
    caae: '12345678.9.0000.0000',
    opinionNumber: '1234.567',
    approvalDate: '2026-09-25',
    document: new File(['pdf'], 'parecer-coep.pdf', { type: 'application/pdf' }),
  },
};

function createTestStore() {
  return configureStore({
    reducer: {
      users: usersReducer,
    },
  });
}

describe('users api', () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it('envia o cadastro como multipart e normaliza a resposta', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({
        id: 7,
        full_name: 'Ana Beatriz Souza',
        email: 'ana.souza@niar-saude.org',
        role: 'researcher',
        created_at: '2026-09-04T10:00:00.000Z',
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const store = createTestStore();
    const result = await store.dispatch(createUser(input));
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(result).toMatchObject({
      type: 'users/createUser/fulfilled',
      payload: {
        id: 7,
        fullName: 'Ana Beatriz Souza',
        email: 'ana.souza@niar-saude.org',
        role: 'researcher',
      },
    });
    expect(store.getState().users).toMatchObject({
      mutation: { operation: 'create', status: 'succeeded', error: null },
    });
    expect(request.method).toBe('POST');
    expect(url).toContain('/api/admin/users');
    expect(request.body).toBeTruthy();
  });

  it('normaliza o erro no estado do domínio', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({
        error: 'User with this email already exists',
      }), { status: 409 }),
    );
    const store = createTestStore();

    await store.dispatch(createUser(input));

    expect(store.getState().users).toEqual(expect.objectContaining({
      mutation: {
        operation: 'create',
        status: 'failed',
        error: {
          status: 409,
          message: 'Este e-mail já está cadastrado.',
          fieldErrors: { email: 'Este e-mail já está cadastrado.' },
        },
      },
    }));
  });

  it('carrega a lista consolidada com filtros e paginação', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({
        items: [{
          id: 8,
          full_name: 'Bruno Lima',
          email: 'bruno.lima@niar-saude.org',
          role: 'admin',
          account_status: 'active',
          created_at: '2026-09-04T10:00:00.000Z',
          profile: null,
          researcher_profile: null,
          committee_profile: null,
          coep: null,
          latest_auth_evaluation: null,
        }],
        pagination: { page: 2, page_size: 10, total_items: 11, total_pages: 2 },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const store = createTestStore();

    await store.dispatch(getUsers({ role: 'admin', accountStatus: 'active', page: 2, pageSize: 10 }));

    expect(store.getState().users).toMatchObject({
      list: {
        status: 'succeeded',
        filters: { role: 'admin', accountStatus: 'active' },
        page: 2,
        pageSize: 10,
        pagination: { page: 2, pageSize: 10, totalItems: 11, totalPages: 2 },
        items: [{
          id: 8,
          fullName: 'Bruno Lima',
          accountStatus: 'active',
        }],
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/users?role=admin&account_status=active&page=2&page_size=10'),
      expect.anything(),
    );
  });
});
