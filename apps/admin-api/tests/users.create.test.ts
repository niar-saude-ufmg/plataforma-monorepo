import { jest } from "@jest/globals";
import request from "supertest";
import type { User } from "@niar/database";

const findByEmail = jest.fn<() => Promise<User | null>>();
const create = jest.fn<() => Promise<User>>();

// Mesma técnica usada em users.list.test.ts: mocka o repository antes de
// qualquer coisa importar o app, pra não depender de um Postgres real.
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findByEmail, create }
}));

const { app } = await import("../src/app.js");

const buildStoredUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: "teste@niar.local.test",
  fullName: "Teste",
  hashedPassword: "hash-fake",
  role: "researcher",
  isActive: true,
  createdAt: new Date("2026-08-25T15:00:00.000Z"),
  ...overrides
});

describe("POST /api/admin/users", () => {
  beforeEach(() => {
    findByEmail.mockReset();
    create.mockReset();
  });

  it("cria um usuário com dados válidos e retorna 201", async () => {
    findByEmail.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildStoredUser());

    const response = await request(app).post("/api/admin/users").send({
      full_name: "Teste",
      email: "teste@niar.local.test",
      password: "senha12345",
      role: "researcher"
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      full_name: "Teste",
      email: "teste@niar.local.test",
      role: "researcher",
      is_active: true
    });
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("created_at");
  });

  it("não expõe password nem hashed_password na resposta", async () => {
    findByEmail.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildStoredUser());

    const response = await request(app).post("/api/admin/users").send({
      full_name: "Teste",
      email: "teste@niar.local.test",
      password: "senha12345",
      role: "researcher"
    });

    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("hashed_password");
  });

  it("retorna 400 para email inválido", async () => {
    const response = await request(app).post("/api/admin/users").send({
      full_name: "Teste",
      email: "emailinvalido",
      password: "senha12345"
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(create).not.toHaveBeenCalled();
  });

  it("retorna 400 para senha muito curta", async () => {
    const response = await request(app).post("/api/admin/users").send({
      full_name: "Teste",
      email: "teste@niar.local",
      password: "123",
      role: "researcher"
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(create).not.toHaveBeenCalled();
  });

  it("retorna 409 quando o email já existe", async () => {
    findByEmail.mockResolvedValueOnce(buildStoredUser());

    const response = await request(app).post("/api/admin/users").send({
      full_name: "B",
      email: "duplicado@niar.local",
      password: "outrasenha",
      role: "researcher"
    });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("already exists");
    expect(create).not.toHaveBeenCalled();
  });
});
