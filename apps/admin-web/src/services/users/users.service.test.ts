import { afterEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_STORAGE_KEY } from "@niar/auth";
import type { CreateUserInput } from "../../types/user.types";
import {
  createAdministratorRequest,
  createAuditorRequest,
  createCommitteeMemberRequest,
  createResearcherRequest,
  createUserRequest,
  downloadUserCoepDocumentRequest,
  getUsersRequest,
  normalizeUserApiError,
  normalizeUserDocumentApiError,
  toUserListItem,
  toCreateUserFormData,
  toUser,
} from "./users.service";

const input: CreateUserInput = {
  fullName: "Ana Beatriz Souza",
  email: "ana.souza@niar-saude.org",
  password: "senhaforte1",
  profile: {
    phone: "(31) 99999-9999",
    institution: "UFMG",
    organizationalUnit: "Faculdade de Medicina",
    contactAddress: "Belo Horizonte - MG",
  },
  researcherProfile: {
    researchArea: "Saúde pública",
    position: "Professora",
  },
  coep: {
    caae: "12345678.9.0000.0000",
    opinionNumber: "1234.567",
    approvalDate: "2026-09-25",
    document: new File(["pdf"], "parecer-coep.pdf", {
      type: "application/pdf",
    }),
  },
};

const rawListUser = {
  id: 7,
  full_name: "Ana Beatriz Souza",
  email: "ana.souza@niar-saude.org",
  role: "researcher" as const,
  account_status: "pending" as const,
  created_at: "2026-09-04T10:00:00.000Z",
  profile: {
    phone: "(31) 99999-9999",
    institution: "UFMG",
    organizational_unit: "Faculdade de Medicina",
    contact_address: "Belo Horizonte - MG",
  },
  researcher_profile: {
    research_area: "Saúde pública",
    position: "Professora",
  },
  committee_profile: null,
  coep: null,
  latest_auth_evaluation: null,
};

describe("user service", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("converte a resposta consolidada e envia filtros paginados", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "fake-token");
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: [rawListUser],
        pagination: { page: 2, page_size: 10, total_items: 11, total_pages: 2 },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getUsersRequest({
      search: "Ana Beatriz",
      role: "researcher",
      accountStatus: "pending",
      page: 2,
      pageSize: 10,
    })).resolves.toEqual({
      items: [toUserListItem(rawListUser)],
      pagination: { page: 2, pageSize: 10, totalItems: 11, totalPages: 2 },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/api/admin/users?search=Ana+Beatriz&role=researcher&account_status=pending&page=2&page_size=10",
      { headers: { Authorization: "Bearer fake-token" } },
    );
  });

  it("monta o cadastro público como multipart com os blocos esperados", () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin/");
    const body = toCreateUserFormData(input);
    expect(body.get("full_name")).toBe("Ana Beatriz Souza");
    expect(JSON.parse(String(body.get("profile")))).toEqual({
      phone: input.profile.phone,
      institution: input.profile.institution,
      organizational_unit: input.profile.organizationalUnit,
      contact_address: input.profile.contactAddress,
    });
    expect(JSON.parse(String(body.get("researcher_profile")))).toEqual({
      research_area: input.researcherProfile.researchArea,
      position: input.researcherProfile.position,
    });
    expect(JSON.parse(String(body.get("coep")))).toEqual({
      caae: input.coep.caae,
      opinion_number: input.coep.opinionNumber,
      approval_date: input.coep.approvalDate,
    });
    expect(body.get("coep_document")).toMatchObject({
      name: input.coep.document.name,
      type: input.coep.document.type,
      size: input.coep.document.size,
    });
    expect(
      toUser({
        id: 7,
        full_name: "Ana Beatriz Souza",
        email: "ana.souza@niar-saude.org",
        role: "researcher",
        created_at: "2026-09-04T10:00:00.000Z",
      }),
    ).toEqual({
      id: 7,
      fullName: "Ana Beatriz Souza",
      email: "ana.souza@niar-saude.org",
      role: "researcher",
      createdAt: "2026-09-04T10:00:00.000Z",
    });
  });

  it("baixa o parecer do COEP usando o id do usuário e o nome do header", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "fake-token");
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("%PDF-fake", {
        status: 200,
        headers: { "Content-Disposition": 'attachment; filename="parecer.pdf"' },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await downloadUserCoepDocumentRequest(7);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/api/admin/users/7/coep-document",
      { headers: { Authorization: "Bearer fake-token" } },
    );
    expect(result.filename).toBe("parecer.pdf");
    expect(await result.blob.text()).toBe("%PDF-fake");
  });

  it("normaliza os erros do download do COEP", () => {
    expect(normalizeUserDocumentApiError(403)).toEqual({
      status: 403,
      message: "Você não tem acesso a este documento.",
    });
    expect(normalizeUserDocumentApiError(404)).toEqual({
      status: 404,
      message: "Documento do COEP não encontrado.",
    });
  });

  it("normaliza conflito de e-mail duplicado", () => {
    expect(
      normalizeUserApiError(409, {
        error: "User with this email already exists",
      }),
    ).toEqual({
      status: 409,
      message: "Este e-mail já está cadastrado.",
      fieldErrors: { email: "Este e-mail já está cadastrado." },
    });
  });

  it("normaliza erros de validação do backend, inclusive blocos aninhados", () => {
    expect(
      normalizeUserApiError(400, {
        errors: [
          { path: ["email"], message: "Invalid email address" },
          {
            path: ["coep", "approval_date"],
            message: "Approval date is not a valid calendar date",
          },
        ],
      }),
    ).toEqual({
      status: 400,
      message: "Revise os campos informados.",
      fieldErrors: {
        email: "Informe um e-mail válido, como nome@instituicao.org.",
        approvalDate: "Informe uma data válida.",
      },
    });
  });
});

describe("user service — cadastros privados", () => {
  it("envia pesquisador privado como multipart com auth para /users/researchers", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "fake-token");
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 8,
        full_name: "Ana Beatriz Souza",
        email: "ana.souza@niar-saude.org",
        role: "researcher",
        created_at: "2026-09-04T10:00:00.000Z",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await createResearcherRequest(input);
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("http://localhost:3333/api/admin/users/researchers");
    expect(request.method).toBe("POST");
    expect(request.headers).toEqual({ Authorization: "Bearer fake-token" });
    expect(request.body).toBeInstanceOf(FormData);
    expect(result.role).toBe("researcher");
  });

  it("envia administrador como JSON com auth para /users/administrators", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "fake-token");
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 9,
        full_name: "Bruno Admin",
        email: "bruno@niar-saude.org",
        role: "admin",
        created_at: "2026-09-04T10:00:00.000Z",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createAdministratorRequest({
      fullName: "  Bruno Admin  ",
      email: "bruno@niar-saude.org",
      password: "senhaforte1",
    });
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("http://localhost:3333/api/admin/users/administrators");
    expect(request.method).toBe("POST");
    expect(request.headers).toEqual({
      Authorization: "Bearer fake-token",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(request.body))).toEqual({
      full_name: "Bruno Admin",       // .trim() aplicado
      email: "bruno@niar-saude.org",
      password: "senhaforte1",
    });
  });

  it("envia auditor como JSON com auth para /users/auditors", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "fake-token");
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 10,
        full_name: "Carla Auditora",
        email: "carla@niar-saude.org",
        role: "auditor",
        created_at: "2026-09-04T10:00:00.000Z",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createAuditorRequest({
      fullName: "Carla Auditora",
      email: "carla@niar-saude.org",
      password: "senhaforte1",
    });
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("http://localhost:3333/api/admin/users/auditors");
    expect(JSON.parse(String(request.body))).toEqual({
      full_name: "Carla Auditora",
      email: "carla@niar-saude.org",
      password: "senhaforte1",
    });
  });

  it("envia comitê como JSON com specialty_id numérico em snake_case", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "fake-token");
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 11,
        full_name: "Diego Membro",
        email: "diego@niar-saude.org",
        role: "committee",
        created_at: "2026-09-04T10:00:00.000Z",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createCommitteeMemberRequest({
      fullName: "Diego Membro",
      email: "diego@niar-saude.org",
      password: "senhaforte1",
      specialtyId: 42,
    });
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("http://localhost:3333/api/admin/users/committee-members");
    const body = JSON.parse(String(request.body));
    expect(body).toEqual({
      full_name: "Diego Membro",
      email: "diego@niar-saude.org",
      password: "senhaforte1",
      specialty_id: 42,           // snake + number
    });
    expect(body).not.toHaveProperty("specialtyId");
    expect(body).not.toHaveProperty("specialty");
  });

  it("o cadastro público NÃO envia Authorization (permanece público)", async () => {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "fake-token");
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 12,
        full_name: "Ana Beatriz Souza",
        email: "ana.souza@niar-saude.org",
        role: "researcher",
        created_at: "2026-09-04T10:00:00.000Z",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await createUserRequest(input);
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("http://localhost:3333/api/admin/users");
    expect(request.headers).toBeUndefined();   // sem Authorization
  });

  it("mapeia specialty_id flat para specialtyId", () => {
    expect(
      normalizeUserApiError(400, {
        errors: [{ path: ["specialty_id"], message: "Specialty is required" }],
      }),
    ).toEqual({
      status: 400,
      message: "Revise os campos informados.",
      fieldErrors: { specialtyId: "Selecione uma especialidade." },
    });
  });

  it("mapeia committee_profile.specialty_id aninhado para specialtyId", () => {
    expect(
      normalizeUserApiError(400, {
        errors: [
          { path: ["committee_profile", "specialty_id"], message: "Specialty is required" },
        ],
      }),
    ).toEqual({
      status: 400,
      message: "Revise os campos informados.",
      fieldErrors: { specialtyId: "Selecione uma especialidade." },
    });
  });
});
