import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_STORAGE_KEY } from "@niar/auth";
import {
  getAdminApiBaseUrl,
  normalizeAuthApiError,
  toAuthUser,
  toUpdateAuthUserBody,
  updateAuthUserRequest,
} from "./auth.service";

const sessionResponse = {
  id: 7,
  email: "pesquisador@niar.local",
  full_name: "Pesquisador NIAR",
  role: "researcher" as const,
  account_status: "active" as const,
  profile: {
    phone: "(31) 99999-9999",
    institution: "UFMG",
    organizational_unit: "DCC",
    contact_address: "Belo Horizonte - MG",
  },
  researcher_profile: { research_area: "Saúde pública", position: "Professor" },
  coep: {
    caae: "12345678.9.0000.0000",
    opinion_number: "1234.567",
    approval_date: "2026-09-25",
    document_filename: "parecer-coep.pdf",
  },
};

describe("auth service", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("usa a VITE_ADMIN_API_URL quando ela estiver definida", () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin/");

    expect(getAdminApiBaseUrl()).toBe("http://localhost:3333/api/admin");
  });

  it("usa a origem atual quando a VITE_ADMIN_API_URL não estiver definida", () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "");

    expect(getAdminApiBaseUrl()).toBe(`${window.location.origin}/api/admin`);
  });
});

describe("updateAuthUserRequest", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    globalThis.fetch = fetchMock as typeof fetch;
    fetchMock.mockReset();
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, "token-de-teste");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  const okResponse = () => ({
    ok: true,
    status: 200,
    json: async () => sessionResponse,
  });

  it("converte camelCase da UI para snake_case da API", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());

    await updateAuthUserRequest({
      operation: "updateProfile",
      data: { fullName: " Nome Novo ", email: "novo@niar.local", phone: "(31) 98888-8888" },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/auth/me");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({
      full_name: "Nome Novo",
      email: "novo@niar.local",
      phone: "(31) 98888-8888",
    });
  });

  it("envia o Bearer token", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());

    await updateAuthUserRequest({ operation: "updateProfile", data: { fullName: "Nome" } });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer token-de-teste");
  });

  it("não envia campos vazios", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());

    await updateAuthUserRequest({
      operation: "updateProfile",
      data: { fullName: "Nome", email: "", phone: "   " },
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ full_name: "Nome" });
  });

  it("envia só current_password e password na troca de senha", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());

    await updateAuthUserRequest({
      operation: "changePassword",
      data: { currentPassword: "senha-atual", password: "nova-senha-123" },
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({ current_password: "senha-atual", password: "nova-senha-123" });
    expect(body).not.toHaveProperty("password_confirmation");
    expect(body).not.toHaveProperty("passwordConfirmation");
  });

  it("converte a resposta snake_case para AuthUser", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());

    const user = await updateAuthUserRequest({ operation: "updateProfile", data: { fullName: "x" } });

    expect(user).toEqual({
      id: 7,
      name: "Pesquisador NIAR",
      email: "pesquisador@niar.local",
      role: "researcher",
      accountStatus: "active",
      profile: {
        phone: "(31) 99999-9999",
        institution: "UFMG",
        organizationalUnit: "DCC",
        contactAddress: "Belo Horizonte - MG",
      },
      researcherProfile: { researchArea: "Saúde pública", position: "Professor" },
      coep: {
        caae: "12345678.9.0000.0000",
        opinionNumber: "1234.567",
        approvalDate: "2026-09-25",
        documentFilename: "parecer-coep.pdf",
      },
    });
  });

  it("normaliza o 409 de e-mail já usado", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: "E-mail já utilizado por outro usuário" }),
    });

    await expect(
      updateAuthUserRequest({ operation: "updateProfile", data: { email: "ocupado@niar.local" } }),
    ).rejects.toMatchObject({
      status: 409,
      fieldErrors: { email: "Este e-mail já está em uso por outro usuário." },
    });
  });

  it("normaliza a senha atual incorreta", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Senha atual incorreta" }),
    });

    await expect(
      updateAuthUserRequest({
        operation: "changePassword",
        data: { currentPassword: "errada", password: "nova-senha-123" },
      }),
    ).rejects.toMatchObject({
      status: 400,
      fieldErrors: { currentPassword: "Senha atual incorreta." },
    });
  });

  it("traduz os erros de validação por campo", () => {
    const error = normalizeAuthApiError(400, {
      errors: [{ path: ["email"], message: "Invalid email address" }],
    });

    expect(error.fieldErrors?.email).toBe("Informe um e-mail válido, como nome@instituicao.org.");
  });

  it("não quebra quando a sessão vem sem perfil opcional", () => {
    expect(
      toAuthUser({
        id: 1,
        email: "admin@niar.local",
        full_name: "Gestor",
        role: "admin",
        account_status: "active",
      }),
    ).toEqual({
      id: 1,
      name: "Gestor",
      email: "admin@niar.local",
      role: "admin",
      accountStatus: "active",
    });
  });

  it("monta o corpo sem chaves extras", () => {
    expect(toUpdateAuthUserBody({ operation: "updateProfile", data: {} })).toEqual({});
  });
});
