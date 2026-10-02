import { afterEach, describe, expect, it, vi } from "vitest";
import type { CreateUserInput } from "../../types/user.types";
import {
  getAdminApiBaseUrl,
  normalizeUserApiError,
  toCreateUserFormData,
  toUser,
} from "./admin-api";

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

describe("admin-api service", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("usa a VITE_ADMIN_API_URL quando ela estiver definida", () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "http://localhost:3333/api/admin/");

    expect(getAdminApiBaseUrl()).toBe("http://localhost:3333/api/admin");
  });

  it("usa a origem atual quando a VITE_ADMIN_API_URL não estiver definida", () => {
    vi.stubEnv("VITE_ADMIN_API_URL", "");

    expect(getAdminApiBaseUrl()).toBe(`${window.location.origin}/api/admin`);
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
        is_active: true,
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
