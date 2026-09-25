import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";
import type { UserRole } from "@niar/contracts";

process.env.SECRET_KEY = "test-secret";

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  hashedPassword: string;
  role: UserRole;
  accountStatus: "pending" | "active" | "rejected" | "disabled";
  createdAt: Date;
};

const findByEmail = jest.fn<() => Promise<StoredUser | null>>();
const findById = jest.fn<(id: number) => Promise<StoredUser | null>>();

// Mesma técnica dos outros testes: mocka o repository antes de importar o
// app, pra não depender de um Postgres real.
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findByEmail, findById }
}));

const { app } = await import("../src/app.js");

const PASSWORD = "senha12345";

// hash real (não mockado): precisa ser um hash de verdade pra bcrypt.compare
// no service conseguir validar a senha certa.
const buildStoredUser = async (overrides: Partial<StoredUser> = {}): Promise<StoredUser> => ({
  id: 1,
  email: "pesquisador@niar.local",
  fullName: "Pesquisador Um",
  hashedPassword: await hash(PASSWORD, 10),
  role: "researcher",
  accountStatus: "active",
  createdAt: new Date("2026-08-25T15:00:00.000Z"),
  ...overrides
});

const tokenFor = (userId: number) => jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

describe("POST /api/admin/auth/login", () => {
  beforeEach(() => {
    findByEmail.mockReset();
  });

  it("retorna o token quando email e senha estão corretos", async () => {
    findByEmail.mockResolvedValueOnce(await buildStoredUser());

    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "pesquisador@niar.local", password: PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.token_type).toBe("bearer");
    expect(typeof response.body.access_token).toBe("string");
  });

  it("retorna 401 quando a senha está errada", async () => {
    findByEmail.mockResolvedValueOnce(await buildStoredUser());

    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "pesquisador@niar.local", password: "senhaerrada" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Credenciais incorretas");
  });

  it("retorna 401 quando o email não existe", async () => {
    findByEmail.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "naoexiste@niar.local", password: PASSWORD });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Credenciais incorretas");
  });

  it("retorna 403 quando o usuário está desativado", async () => {
    findByEmail.mockResolvedValueOnce(await buildStoredUser({ accountStatus: "disabled" }));

    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "pesquisador@niar.local", password: PASSWORD });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Conta não está ativa");
  });

  it("retorna 400 para email em formato inválido", async () => {
    const response = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "emailinvalido", password: PASSWORD });

    expect(response.status).toBe(400);
    expect(findByEmail).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/auth/me", () => {
  beforeEach(() => {
    findById.mockReset();
  });

  it("retorna os dados do usuário autenticado", async () => {
    findById.mockResolvedValueOnce(await buildStoredUser());

    const response = await request(app).get("/api/admin/auth/me").set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      email: "pesquisador@niar.local",
      full_name: "Pesquisador Um",
      role: "researcher",
      account_status: "active",
      is_active: true
    });
  });

  it("não expõe password nem hashed_password na resposta", async () => {
    findById.mockResolvedValueOnce(await buildStoredUser());

    const response = await request(app).get("/api/admin/auth/me").set("Authorization", `Bearer ${tokenFor(1)}`);

    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("hashed_password");
    expect(response.body).not.toHaveProperty("hashedPassword");
  });

  it("retorna 401 sem token", async () => {
    const response = await request(app).get("/api/admin/auth/me");

    expect(response.status).toBe(401);
  });
});
