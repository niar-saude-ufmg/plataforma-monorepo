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
  accountStatus: "pending" | "active" | "rejected" | "disabled";
  createdAt: Date;
};

const findByEmail = jest.fn<() => Promise<StoredUser | null>>();
const create = jest.fn<() => Promise<StoredUser>>();
const findById = jest.fn<(id: number) => Promise<StoredUser | null>>();
const createResearcher = jest.fn<() => Promise<StoredUser>>();
const createCommitteeMember = jest.fn<() => Promise<StoredUser>>();
const createAdministrator = jest.fn<() => Promise<StoredUser>>();
const findSpecialtyById = jest.fn<(id: number) => Promise<{ id: number; isActive: boolean } | null>>();
const auditCreate = jest.fn<() => Promise<unknown>>();

// Mesma técnica usada em users.list.test.ts: mocka o repository antes de
// qualquer coisa importar o app, pra não depender de um Postgres real.
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: {
    findByEmail,
    create,
    findById,
    createResearcher,
    createCommitteeMember,
    createAdministrator
  }
}));

jest.unstable_mockModule("../src/repositories/audit-repository.js", () => ({
  auditRepository: { create: auditCreate }
}));

jest.unstable_mockModule("../src/repositories/specialties-repository.js", () => ({
  specialtiesRepository: { findById: findSpecialtyById }
}));

const { app } = await import("../src/app.js");

const buildStoredUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({
  id: 1,
  email: "teste@niar.local.test",
  fullName: "Teste",
  hashedPassword: "hash-fake",
  role: "researcher",
  accountStatus: "active",
  createdAt: new Date("2026-08-25T15:00:00.000Z"),
  ...overrides
});

const tokenFor = (userId: number) => jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

const buildAdmin = (id = 10) => buildStoredUser({ id, role: "admin" });

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

describe("POST /api/admin/users/researchers", () => {
  const validPayload = {
    full_name: "Pesquisador Teste",
    email: "pesquisador@niar.local",
    password: "senha12345",
    profile: {},
    researcher_profile: {},
    coep: {
      caae: "12345678.9.0000.0000",
      opinion_number: "4.567.890",
      approval_date: "2026-01-15",
      document_filename: "parecer.pdf",
      document_storage_path: "/exports/coep/parecer.pdf",
    },
  };

  beforeEach(() => {
    findByEmail.mockReset();
    findById.mockReset();
    createResearcher.mockReset();
    auditCreate.mockReset();
  });

  it("admin autenticado cria pesquisador e gera audit log associado ao admin", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));
    findByEmail.mockResolvedValueOnce(null);
    createResearcher.mockResolvedValueOnce(
      buildStoredUser({
        id: 30,
        role: "researcher",
        email: validPayload.email,
        fullName: validPayload.full_name,
      })
    );

    const response = await request(app)
      .post("/api/admin/users/researchers")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      full_name: validPayload.full_name,
      email: validPayload.email,
      role: "researcher",
      is_active: true,
    });
    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("hashed_password");

    // audit log
    expect(auditCreate).toHaveBeenCalledTimes(1);
    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 10,
        action: "create_researcher",
        resourceType: "user",
        resourceId: "30",
      })
    );
  });

  it("retorna 401 sem autenticação", async () => {
    const response = await request(app)
      .post("/api/admin/users/researchers")
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(createResearcher).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });

  it("researcher autenticado não pode criar pesquisador", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 20, role: "researcher" }));

    const response = await request(app)
      .post("/api/admin/users/researchers")
      .set("Authorization", `Bearer ${tokenFor(20)}`)
      .send(validPayload);

    expect(response.status).toBe(403);
    expect(createResearcher).not.toHaveBeenCalled();
  });

  it("committee autenticado não pode criar pesquisador", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 21, role: "committee" }));

    const response = await request(app)
      .post("/api/admin/users/researchers")
      .set("Authorization", `Bearer ${tokenFor(21)}`)
      .send(validPayload);

    expect(response.status).toBe(403);
    expect(createResearcher).not.toHaveBeenCalled();
  });

  it("retorna 400 para payload incompleto", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));

    const response = await request(app)
      .post("/api/admin/users/researchers")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ full_name: "X", email: "x@niar.local" }); // sem password nem coep

    expect(response.status).toBe(400);
    expect(createResearcher).not.toHaveBeenCalled();
  });

  it("retorna 409 para e-mail duplicado", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));
    findByEmail.mockResolvedValueOnce(buildStoredUser({ email: validPayload.email }));

    const response = await request(app)
      .post("/api/admin/users/researchers")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send(validPayload);

    expect(response.status).toBe(409);
    expect(createResearcher).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin/users/committee-members", () => {
  const validPayload = {
    full_name: "Membro do Comitê",
    email: "comite@niar.local",
    password: "senha12345",
    specialty_id: 2,
  };

  beforeEach(() => {
    findByEmail.mockReset();
    findById.mockReset();
    createCommitteeMember.mockReset();
    findSpecialtyById.mockReset();
    auditCreate.mockReset();
  });

  it("admin autenticado cria membro do comitê e gera audit log", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));
    findByEmail.mockResolvedValueOnce(null);
    findSpecialtyById.mockResolvedValueOnce({ id: 2, isActive: true });
    createCommitteeMember.mockResolvedValueOnce(
      buildStoredUser({
        id: 31,
        role: "committee",
        email: validPayload.email,
        fullName: validPayload.full_name,
      })
    );

    const response = await request(app)
      .post("/api/admin/users/committee-members")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("committee");
    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("hashed_password");

    expect(auditCreate).toHaveBeenCalledTimes(1);
    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 10,
        action: "create_committee_member",
        resourceId: "31",
      })
    );
  });

  it("retorna 401 sem autenticação", async () => {
    const response = await request(app)
      .post("/api/admin/users/committee-members")
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(createCommitteeMember).not.toHaveBeenCalled();
  });

  it("researcher autenticado não pode criar membro do comitê", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 20, role: "researcher" }));
    findSpecialtyById.mockResolvedValueOnce({ id: 2, isActive: true });

    const response = await request(app)
      .post("/api/admin/users/committee-members")
      .set("Authorization", `Bearer ${tokenFor(20)}`)
      .send(validPayload);

    expect(response.status).toBe(403);
    expect(createCommitteeMember).not.toHaveBeenCalled();
  });

  it("retorna 400 quando specialty_id não existe", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));
    findSpecialtyById.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/admin/users/committee-members")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send(validPayload);

    expect(response.status).toBe(400);
    expect(createCommitteeMember).not.toHaveBeenCalled();
  });

  it("retorna 400 quando especialidade está inativa", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));
    findSpecialtyById.mockResolvedValueOnce({ id: 2, isActive: false });

    const response = await request(app)
      .post("/api/admin/users/committee-members")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send(validPayload);

    expect(response.status).toBe(400);
    expect(createCommitteeMember).not.toHaveBeenCalled();
  });

  it("retorna 400 para payload incompleto (sem specialty_id)", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));

    const { specialty_id, ...incomplete } = validPayload;
    const response = await request(app)
      .post("/api/admin/users/committee-members")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send(incomplete);

    expect(response.status).toBe(400);
    expect(createCommitteeMember).not.toHaveBeenCalled();
  });

  it("retorna 409 para e-mail duplicado", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));
    findSpecialtyById.mockResolvedValueOnce({ id: 2, isActive: true });
    findByEmail.mockResolvedValueOnce(buildStoredUser({ email: validPayload.email }));

    const response = await request(app)
      .post("/api/admin/users/committee-members")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send(validPayload);

    expect(response.status).toBe(409);
    expect(createCommitteeMember).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin/users/administrators", () => {
  const validPayload = {
    full_name: "Administrador",
    email: "admin2@niar.local",
    password: "senha12345",
  };

  beforeEach(() => {
    findByEmail.mockReset();
    findById.mockReset();
    create.mockReset();
    auditCreate.mockReset();
  });

  it("admin autenticado cria administrador e gera audit log", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));
    findByEmail.mockResolvedValueOnce(null);
    createAdministrator.mockResolvedValueOnce(
      buildStoredUser({ id: 32, role: "admin", email: validPayload.email, fullName: validPayload.full_name })
    );

    const response = await request(app)
      .post("/api/admin/users/administrators")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("admin");
    expect(response.body).not.toHaveProperty("password");
    expect(response.body).not.toHaveProperty("hashed_password");

    expect(auditCreate).toHaveBeenCalledTimes(1);
    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 10,
        action: "create_administrator",
        resourceId: "32",
      })
    );
  });

  it("retorna 401 sem autenticação", async () => {
    const response = await request(app)
      .post("/api/admin/users/administrators")
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it("committee autenticado não pode criar administrador", async () => {
    findById.mockResolvedValueOnce(buildStoredUser({ id: 21, role: "committee" }));

    const response = await request(app)
      .post("/api/admin/users/administrators")
      .set("Authorization", `Bearer ${tokenFor(21)}`)
      .send(validPayload);

    expect(response.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("retorna 400 para payload incompleto", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));

    const response = await request(app)
      .post("/api/admin/users/administrators")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ email: "x@niar.local" }); // sem full_name e password

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("retorna 409 para e-mail duplicado", async () => {
    findById.mockResolvedValueOnce(buildAdmin(10));
    findByEmail.mockResolvedValueOnce(buildStoredUser({ email: validPayload.email }));

    const response = await request(app)
      .post("/api/admin/users/administrators")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send(validPayload);

    expect(response.status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });
});
