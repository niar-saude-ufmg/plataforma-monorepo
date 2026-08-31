import { jest } from "@jest/globals";
import request from "supertest";
import type { UserListRecord } from "../src/repositories/users-repository.js";

const findAll = jest.fn<() => Promise<UserListRecord[]>>();

// Mocka o repository antes de qualquer coisa importar o app: assim o teste
// não depende de um Postgres real rodando. Em ESM o mock precisa ser
// registrado (unstable_mockModule) antes do import, por isso o app só é
// importado dinamicamente depois, na linha seguinte.
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findAll }
}));

const { app } = await import("../src/app.js");

// Builder único para a fixture usada nos testes: evita repetir o mesmo
// objeto em cada "it" e deixa cada teste customizar só o que importa pra ele.
const buildUserRecord = (overrides: Partial<UserListRecord> = {}): UserListRecord => ({
  id: 1,
  email: "pesquisador1@niar.local",
  fullName: "Pesquisador Um",
  role: "researcher",
  isActive: true,
  createdAt: new Date("2026-08-25T15:00:00.000Z"),
  ...overrides
});

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    findAll.mockReset();
  });

  it("retorna 200 com a lista de usuários", async () => {
    findAll.mockResolvedValueOnce([buildUserRecord()]);

    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(200);
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

  it("retorna lista vazia quando não há usuários", async () => {
    findAll.mockResolvedValueOnce([]);

    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("não expõe hashed_password nem password na resposta", async () => {
    findAll.mockResolvedValueOnce([buildUserRecord()]);

    const response = await request(app).get("/api/admin/users");

    expect(response.body[0]).not.toHaveProperty("password");
    expect(response.body[0]).not.toHaveProperty("hashed_password");
    expect(response.body[0]).not.toHaveProperty("hashedPassword");
  });
});
