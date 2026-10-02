import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CreateUserInput } from '../../types/user.types';
import { adminApi } from '../api/admin.api';
import { usersApi } from './users.api';

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
      [adminApi.reducerPath]: adminApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(adminApi.middleware),
  });
}

describe('usersApi', () => {
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
        is_active: true,
        created_at: '2026-09-04T10:00:00.000Z',
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const result = await createTestStore().dispatch(
      usersApi.endpoints.createUser.initiate(input),
    );
    const request = fetchMock.mock.calls[0]?.[0] as Request;

    expect(result).toMatchObject({
      data: {
        id: 7,
        fullName: 'Ana Beatriz Souza',
        email: 'ana.souza@niar-saude.org',
        role: 'researcher',
      },
    });
    expect(request.method).toBe('POST');
    expect(request.url).toContain('/api/admin/users');
    expect(request.body).toBeTruthy();
  });
});
