import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";

process.env.SECRET_KEY = "test-secret";

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  hashedPassword: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
};

const findByEmail = jest.fn<() => Promise<StoredUser | null>>();
const create = jest.fn<() => Promise<StoredUser>>();
const findById = jest.fn<(id: number) => Promise<StoredUser | null>>();

// Mesma técnica usada em users.list.test.ts: mocka o repository antes de
// qualquer coisa importar o app, pra não depender de um Postgres real.
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findByEmail, create, findById }
}));

const { app } = await import("../src/app.js");

const buildStoredUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({
  id: 1,
  email: "teste@niar.local.test",
  fullName: "Teste",
  hashedPassword: "hash-fake",
  role: "researcher",
  isActive: true,
  createdAt: new Date("2026-08-25T15:00:00.000Z"),
  ...overrides
});

const tokenFor = (userId: number) => jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

describe("POST /api/admin/users (público)", () => {
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
      password: "senha12345"
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

  it("ignora role enviada pelo cliente e cria sempre researcher", async () => {
    findByEmail.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildStoredUser({ role: "researcher" }));

    await request(app).post("/api/admin/users").send({
      full_name: "Teste",
      email: "teste@niar.local.test",
      password: "senha12345",
      role: "admin"
    });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ role: "researcher" }));
  });

  it("não expõe password nem hashed_password na resposta", async () => {
    findByEmail.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildStoredUser());

    const response = await request(app).post("/api/admin/users").send({
      full_name: "Teste",
      email: "teste@niar.local.test",
      password: "senha12345"
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
      password: "123"
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
      password: "outrasenha"
    });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("already exists");
    expect(create).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin/users/internal (protegido)", () => {
  beforeEach(() => {
    findByEmail.mockReset();
    create.mockReset();
    findById.mockReset();
  });

  it("retorna 401 sem autenticação", async () => {
    const response = await request(app).post("/api/admin/users/internal").send({
      full_name: "Novo Admin",
      email: "novo-admin@niar.local",
      password: "senha12345",
      role: "admin"
    });

    expect(response.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it("researcher autenticado não consegue usar o cadastro protegido", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 20, role: "researcher" }));

    const response = await request(app)
      .post("/api/admin/users/internal")
      .set("Authorization", `Bearer ${tokenFor(20)}`)
      .send({ full_name: "X", email: "x@niar.local", password: "senha12345", role: "committee" });

    expect(response.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("committee autenticado não consegue usar o cadastro protegido", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 21, role: "committee" }));

    const response = await request(app)
      .post("/api/admin/users/internal")
      .set("Authorization", `Bearer ${tokenFor(21)}`)
      .send({ full_name: "X", email: "x@niar.local", password: "senha12345", role: "researcher" });

    expect(response.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("admin autenticado consegue criar um committee", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 10, role: "admin" }));
    findByEmail.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildStoredUser({ id: 30, role: "committee", email: "comite@niar.local" }));

    const response = await request(app)
      .post("/api/admin/users/internal")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ full_name: "Membro do Comitê", email: "comite@niar.local", password: "senha12345", role: "committee" });

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("committee");
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ role: "committee" }));
  });

  it("admin autenticado consegue criar outro admin", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 10, role: "admin" }));
    findByEmail.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildStoredUser({ id: 31, role: "admin", email: "outro-admin@niar.local" }));

    const response = await request(app)
      .post("/api/admin/users/internal")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ full_name: "Outro Gestor", email: "outro-admin@niar.local", password: "senha12345", role: "admin" });

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("admin");
  });
});
