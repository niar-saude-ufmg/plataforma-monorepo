import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import type { UserListFilter, UserListRecord } from "../src/repositories/users-repository.js";

process.env.SECRET_KEY = "test-secret";

type StoredUser = {
  id: number;
  role: UserRole;
  isActive: boolean;
};

const findAll = jest.fn<(filter: UserListFilter) => Promise<UserListRecord[]>>();
const findById = jest.fn<(id: number) => Promise<StoredUser | null>>();

// Mocka o repository antes de qualquer coisa importar o app: assim o teste
// não depende de um Postgres real rodando. Em ESM o mock precisa ser
// registrado (unstable_mockModule) antes do import, por isso o app só é
// importado dinamicamente depois, na linha seguinte.
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findAll, findById }
}));

const { app } = await import("../src/app.js");

const buildUserRecord = (overrides: Partial<UserListRecord> = {}): UserListRecord => ({
  id: 1,
  email: "pesquisador1@niar.local",
  fullName: "Pesquisador Um",
  role: "researcher",
  isActive: true,
  createdAt: new Date("2026-08-25T15:00:00.000Z"),
  ...overrides
});

const buildAuthUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({
  id: 10,
  role: "admin",
  isActive: true,
  ...overrides
});

// Assina um token do mesmo jeito que o assistente (Python) faz: só "sub"
// (id do usuário) e HS256, sem role dentro do token.
const tokenFor = (userId: number) => jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    findAll.mockReset();
    findById.mockReset();
  });

  it("retorna 401 sem token", async () => {
    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(401);
  });

  it("retorna 401 com token inválido", async () => {
    const response = await request(app).get("/api/admin/users").set("Authorization", "Bearer token-invalido");

    expect(response.status).toBe(401);
  });

  it("admin lista sem filtro de papel", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 10, role: "admin" }));
    findAll.mockResolvedValueOnce([buildUserRecord()]);

    const response = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ role: undefined, page: 1, pageSize: 20 });
    expect(response.body).toEqual([
      {
        id: 1,
        email: "pesquisador1@niar.local",
        full_name: "Pesquisador Um",
        role: "researcher",
        is_active: true,
        created_at: "2026-08-25T15:00:00.000Z"
      }
    ]);
  });

  it("committee recebe só researcher mesmo sem informar filtro", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 11, role: "committee" }));
    findAll.mockResolvedValueOnce([]);

    const response = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${tokenFor(11)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ role: "researcher", page: 1, pageSize: 20 });
  });

  it("committee pedindo outro papel explicitamente recebe 403", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 11, role: "committee" }));

    const response = await request(app)
      .get("/api/admin/users?role=admin")
      .set("Authorization", `Bearer ${tokenFor(11)}`);

    expect(response.status).toBe(403);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("researcher não acessa a listagem", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 12, role: "researcher" }));

    const response = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${tokenFor(12)}`);

    expect(response.status).toBe(403);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("aplica página e tamanho de página informados", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 10, role: "admin" }));
    findAll.mockResolvedValueOnce([]);

    const response = await request(app)
      .get("/api/admin/users?page=2&page_size=5")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ role: undefined, page: 2, pageSize: 5 });
  });

  it("não expõe hashed_password nem password na resposta", async () => {
    findById.mockResolvedValueOnce(buildAuthUser({ id: 10, role: "admin" }));
    findAll.mockResolvedValueOnce([buildUserRecord()]);

    const response = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.body[0]).not.toHaveProperty("password");
    expect(response.body[0]).not.toHaveProperty("hashed_password");
    expect(response.body[0]).not.toHaveProperty("hashedPassword");
  });
});
