import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { UserAccountStatus, UserRole } from "@niar/contracts";
import jwt from "jsonwebtoken";
import request from "supertest";
import type {
  ConsolidatedUserRecord,
  UserListFilter,
  UserListPage
} from "../src/repositories/users-repository.js";

process.env.SECRET_KEY = "test-secret";

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: UserAccountStatus;
};

const findAll = jest.fn<(filter: UserListFilter) => Promise<UserListPage>>();
const findById = jest.fn<(id: number) => Promise<StoredUser | null>>();
const findDetailById = jest.fn<
  (id: number, role?: UserRole) => Promise<ConsolidatedUserRecord | null>
>();

jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findAll, findById, findDetailById }
}));

const { app } = await import("../src/app.js");

const buildUserRecord = (overrides: Partial<ConsolidatedUserRecord> = {}): ConsolidatedUserRecord => ({
  id: 10,
  email: "pesquisador@exemplo.com",
  fullName: "Pesquisador Teste",
  role: "researcher",
  accountStatus: "pending",
  createdAt: new Date("2026-09-25T20:00:00.000Z"),
  profile: {
    phone: "(31) 99999-9999",
    institution: "UFMG",
    organizationalUnit: "Faculdade de Medicina",
    contactAddress: "Belo Horizonte - MG"
  },
  researcherProfile: {
    researchArea: "Saúde pública",
    position: "Professor"
  },
  committeeProfile: null,
  coepData: [
    {
      id: 4,
      caae: "12345678.9.0000.0000",
      opinionNumber: "1234.567",
      approvalDate: new Date("2026-09-25T00:00:00.000Z"),
      documentFilename: "parecer-coep.pdf"
    }
  ],
  authEvaluations: [
    {
      id: 12,
      userId: 10,
      status: "pending",
      justification: null,
      evaluatedByUserId: 7,
      evaluatedAt: new Date("2026-09-26T12:00:00.000Z"),
      createdAt: new Date("2026-09-26T12:00:00.000Z"),
      userCoepDataId: 4
    }
  ],
  ...overrides
});

const buildAuthUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({
  id: 1,
  email: "admin@niar.local",
  fullName: "Administrador",
  role: "admin",
  accountStatus: "active",
  ...overrides
});

const tokenFor = (userId: number) =>
  jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

const expectedConsolidatedUser = {
  id: 10,
  email: "pesquisador@exemplo.com",
  full_name: "Pesquisador Teste",
  role: "researcher",
  account_status: "pending",
  created_at: "2026-09-25T20:00:00.000Z",
  profile: {
    phone: "(31) 99999-9999",
    institution: "UFMG",
    organizational_unit: "Faculdade de Medicina",
    contact_address: "Belo Horizonte - MG"
  },
  researcher_profile: {
    research_area: "Saúde pública",
    position: "Professor"
  },
  committee_profile: null,
  coep: {
    id: 4,
    caae: "12345678.9.0000.0000",
    opinion_number: "1234.567",
    approval_date: "2026-09-25",
    document_filename: "parecer-coep.pdf",
    download_url: "/api/admin/users/10/coep-document"
  },
  latest_auth_evaluation: {
    id: 12,
    user_id: 10,
    status: "pending",
    justification: null,
    evaluated_by_user_id: 7,
    evaluated_at: "2026-09-26T12:00:00.000Z",
    created_at: "2026-09-26T12:00:00.000Z",
    user_coep_data_id: 4
  }
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/admin/users", () => {
  it("retorna 401 sem token", async () => {
    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(401);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("retorna envelope paginado com os dados consolidados", async () => {
    findById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce({ items: [buildUserRecord()], totalItems: 42 });

    const response = await request(app)
      .get("/api/admin/users?page=1&page_size=20&role=researcher&account_status=pending")
      .set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledTimes(1);
    expect(findAll).toHaveBeenCalledWith({
      role: "researcher",
      accountStatus: "pending",
      page: 1,
      pageSize: 20
    });
    expect(response.body).toEqual({
      items: [expectedConsolidatedUser],
      pagination: {
        page: 1,
        page_size: 20,
        total_items: 42,
        total_pages: 3
      }
    });
  });

  it("calcula zero páginas quando não há resultados", async () => {
    findById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce({ items: [], totalItems: 0 });

    const response = await request(app)
      .get("/api/admin/users?page=2&page_size=5")
      .set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [],
      pagination: { page: 2, page_size: 5, total_items: 0, total_pages: 0 }
    });
  });

  it("committee recebe somente pesquisadores e pode filtrar pelo status", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 2, role: "committee" }));
    findAll.mockResolvedValueOnce({ items: [], totalItems: 0 });

    const response = await request(app)
      .get("/api/admin/users?account_status=disabled")
      .set("Authorization", `Bearer ${tokenFor(2)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({
      role: "researcher",
      accountStatus: "disabled",
      page: 1,
      pageSize: 20
    });
  });

  it("committee não pode solicitar outro papel", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 2, role: "committee" }));

    const response = await request(app)
      .get("/api/admin/users?role=admin")
      .set("Authorization", `Bearer ${tokenFor(2)}`);

    expect(response.status).toBe(403);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("researcher não acessa a listagem", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 3, role: "researcher" }));

    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${tokenFor(3)}`);

    expect(response.status).toBe(403);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("rejeita status de conta inválido", async () => {
    findById.mockResolvedValueOnce(buildAuthUser());

    const response = await request(app)
      .get("/api/admin/users?account_status=unknown")
      .set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.status).toBe(400);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("retorna blocos ausentes como null", async () => {
    findById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce({
      items: [
        buildUserRecord({
          profile: null,
          researcherProfile: null,
          committeeProfile: null,
          coepData: [],
          authEvaluations: []
        })
      ],
      totalItems: 1
    });

    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.status).toBe(200);
    expect(response.body.items[0]).toMatchObject({
      profile: null,
      researcher_profile: null,
      committee_profile: null,
      coep: null,
      latest_auth_evaluation: null
    });
  });

  it("não expõe credenciais nem o caminho interno do COEP", async () => {
    findById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce({ items: [buildUserRecord()], totalItems: 1 });

    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${tokenFor(1)}`);
    const serialized = JSON.stringify(response.body);

    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("document_storage_path");
    expect(serialized).not.toContain("documentStoragePath");
  });
});

describe("GET /api/admin/users/:user_id", () => {
  it("admin consulta qualquer usuário no mesmo formato da listagem", async () => {
    findById.mockResolvedValueOnce(buildAuthUser());
    findDetailById.mockResolvedValueOnce(
      buildUserRecord({
        role: "committee",
        researcherProfile: null,
        committeeProfile: {
          specialty: { id: 2, code: "epidemiology", name: "Epidemiologia" }
        },
        coepData: []
      })
    );

    const response = await request(app)
      .get("/api/admin/users/10")
      .set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.status).toBe(200);
    expect(findDetailById).toHaveBeenCalledWith(10, undefined);
    expect(response.body).toMatchObject({
      id: 10,
      role: "committee",
      researcher_profile: null,
      committee_profile: {
        specialty: { id: 2, code: "epidemiology", name: "Epidemiologia" }
      },
      coep: null
    });
    expect(response.body).not.toHaveProperty("items");
    expect(response.body).not.toHaveProperty("pagination");
  });

  it("committee consulta usuário somente dentro do escopo researcher", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 2, role: "committee" }));
    findDetailById.mockResolvedValueOnce(buildUserRecord());

    const response = await request(app)
      .get("/api/admin/users/10")
      .set("Authorization", `Bearer ${tokenFor(2)}`);

    expect(response.status).toBe(200);
    expect(findDetailById).toHaveBeenCalledWith(10, "researcher");
    expect(response.body).toEqual(expectedConsolidatedUser);
  });

  it("não revela ao comitê usuário fora do escopo", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 2, role: "committee" }));
    findDetailById.mockResolvedValueOnce(null);

    const response = await request(app)
      .get("/api/admin/users/20")
      .set("Authorization", `Bearer ${tokenFor(2)}`);

    expect(response.status).toBe(404);
    expect(findDetailById).toHaveBeenCalledWith(20, "researcher");
  });

  it("retorna 404 para usuário inexistente", async () => {
    findById.mockResolvedValueOnce(buildAuthUser());
    findDetailById.mockResolvedValueOnce(null);

    const response = await request(app)
      .get("/api/admin/users/999")
      .set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.status).toBe(404);
  });

  it("researcher não acessa a consulta individual", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 3, role: "researcher" }));

    const response = await request(app)
      .get("/api/admin/users/10")
      .set("Authorization", `Bearer ${tokenFor(3)}`);

    expect(response.status).toBe(403);
    expect(findDetailById).not.toHaveBeenCalled();
  });
});

describe("Swagger de consulta de usuários", () => {
  it("publica filtro por status, envelope paginado e consulta individual", async () => {
    const response = await request(app).get("/api/admin/docs.json");
    const listOperation = response.body.paths["/admin/users"].get;
    const accountStatusParameter = listOperation.parameters.find(
      (parameter: { name: string }) => parameter.name === "account_status"
    );

    expect(response.status).toBe(200);
    expect(accountStatusParameter.schema.enum).toEqual(["pending", "active", "rejected", "disabled"]);
    expect(listOperation.responses["200"].content["application/json"].schema.$ref).toBe(
      "#/components/schemas/PaginatedUsersResponse"
    );
    expect(
      response.body.paths["/admin/users/{user_id}"].get.responses["200"].content["application/json"].schema.$ref
    ).toBe("#/components/schemas/ConsolidatedUserResponse");
  });
});
