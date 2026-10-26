import { configureStore } from '@reduxjs/toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CreateUserInput } from '../../types/user.types';
import {
  createUser,
  createAdministrator,
  createAuditor,
  createCommitteeMember,
  createResearcher,
  downloadUserCoepDocument,
  getUsers
} from './users.api';
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
    vi.restoreAllMocks();
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

    await store.dispatch(getUsers({ search: 'Bruno', role: 'admin', accountStatus: 'active', page: 2, pageSize: 10 }));

    expect(store.getState().users).toMatchObject({
      list: {
        status: 'succeeded',
        filters: { search: 'Bruno', role: 'admin', accountStatus: 'active' },
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
      expect.stringContaining('/api/admin/users?search=Bruno&role=admin&account_status=active&page=2&page_size=10'),
      expect.anything(),
    );
  });

  it('baixa o parecer do COEP e registra o nome no estado', async () => {
    fetchMock.mockResolvedValue(
      new Response('%PDF-fake', {
        status: 200,
        headers: { 'Content-Disposition': 'attachment; filename="parecer.pdf"' },
      }),
    );
    const createObjectURL = vi.fn().mockReturnValue('blob:parecer');
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const store = createTestStore();

    await store.dispatch(downloadUserCoepDocument(7));

    expect(store.getState().users.download).toEqual({
      status: 'succeeded',
      error: null,
      filename: 'parecer.pdf',
    });
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('createResearcher despacha multipart para o endpoint privado', async () => {
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
    const result = await store.dispatch(createResearcher(input));
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(result).toMatchObject({
      type: 'users/createResearcher/fulfilled',
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
    expect(url).toContain('/users/researchers');
    expect(request.body).toBeTruthy();
  });

  it('createAdministrator envia JSON e atualiza mutation, não list', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({
        id: 9,
        full_name: "Bruno Admin",
        email: "bruno@niar-saude.org",
        role: "admin",
        created_at: "2026-09-04T10:00:00.000Z",
      }), { status: 201, headers: { "Content-Type": "application/json" } }),
    );
    const store = createTestStore();

    await store.dispatch(createAdministrator({
      fullName: "Bruno Admin",
      email: "bruno@niar-saude.org",
      password: "senhaforte1",
    }));
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toContain("/users/administrators");
    expect(JSON.parse(String(request.body))).toEqual({
      full_name: "Bruno Admin",
      email: "bruno@niar-saude.org",
      password: "senhaforte1",
    });
    expect(store.getState().users.mutation.status).toBe("succeeded");
    expect(store.getState().users.list.status).toBe("idle");  // separação
  });

  it("createAuditor envia JSON para /users/auditors", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({
        id: 10,
        full_name: "Carla Auditora",
        email: "carla@niar-saude.org",
        role: "auditor",
        created_at: "2026-09-04T10:00:00.000Z",
      }), { status: 201, headers: { "Content-Type": "application/json" } }),
    );
    const store = createTestStore();

    await store.dispatch(createAuditor({
      fullName: "Carla Auditora",
      email: "carla@niar-saude.org",
      password: "senhaforte1",
    }));
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      full_name: "Carla Auditora",
      email: "carla@niar-saude.org",
      password: "senhaforte1",
    });
    expect(url).toContain("/users/auditors");
    expect(store.getState().users.mutation.status).toBe("succeeded");
  });

  it("createCommitteeMember envia specialty_id numérico em snake_case", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({
        id: 11,
        full_name: "Diego Membro",
        email: "diego@niar-saude.org",
        role: "committee",
        created_at: "2026-09-04T10:00:00.000Z",
      }), { status: 201, headers: { "Content-Type": "application/json" } }),
    );
    const store = createTestStore();

    await store.dispatch(createCommitteeMember({
      fullName: "Diego Membro",
      email: "diego@niar-saude.org",
      password: "senhaforte1",
      specialtyId: 42,
    }));
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(JSON.parse(String(request.body))).toEqual({
      full_name: "Diego Membro",
      email: "diego@niar-saude.org",
      password: "senhaforte1",
      specialty_id: 42,
    });
    expect(url).toContain("/users/committee-members");
    expect(JSON.parse(String(request.body))).toMatchObject({
      specialty_id: 42,
    });
  });

  it("createX.pending não altera list.status (separação list/mutation)", async () => {
    let resolveFetch: ((r: Response) => void) | undefined;
    fetchMock.mockImplementation(() => new Promise<Response>((r) => { resolveFetch = r; }));
    const store = createTestStore();

    const pending = store.dispatch(createAdministrator({
      fullName: "X", email: "x@x.org", password: "senhaforte1",
    }));

    expect(store.getState().users.mutation).toEqual({
      operation: "create",
      status: "pending",
      error: null,
    });
    expect(store.getState().users.list.status).toBe("idle");

    resolveFetch!(new Response(JSON.stringify({
      id: 1, full_name: "X", email: "x@x.org", role: "admin",
      created_at: "2026-09-04T10:00:00.000Z",
    }), { status: 201 }));
    await pending;
  });

  it("createAdministrator.rejected usa a mensagem específica do role", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "internal" }), { status: 500 }),
    );
    const store = createTestStore();

    await store.dispatch(createAdministrator({
      fullName: "X", email: "x@x.org", password: "senhaforte1",
    }));

    expect(store.getState().users.mutation.status).toBe("failed");
    expect(store.getState().users.mutation.error?.message).toContain(
      "cadastrar o administrador",
    );
    // e list permanece intacta
    expect(store.getState().users.list.status).toBe("idle");
    expect(store.getState().users.list.error).toBeNull();
  });
});
