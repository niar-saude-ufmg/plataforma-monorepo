import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import type { SpecialtyListFilter, SpecialtyRecord, UpdateSpecialtyData } from "../src/repositories/specialties-repository.js";

process.env.SECRET_KEY = "test-secret";

type StoredUser = {
  id: number;
  role: UserRole;
  isActive: boolean;
};

const findAll = jest.fn<(filter: SpecialtyListFilter) => Promise<SpecialtyRecord[]>>();
const findById = jest.fn<(id: number) => Promise<SpecialtyRecord | null>>();
const findByCode = jest.fn<(code: string) => Promise<SpecialtyRecord | null>>();
const findByNameNormalized = jest.fn<(nameNormalized: string) => Promise<SpecialtyRecord | null>>();
const create = jest.fn<() => Promise<SpecialtyRecord>>();
const update = jest.fn<(id: number, data: UpdateSpecialtyData) => Promise<SpecialtyRecord>>();

const findUserById = jest.fn<(id: number) => Promise<StoredUser | null>>();

// Mesma técnica dos outros testes de rota: mocka os repositories antes de
// qualquer coisa importar o app, pra não depender de um Postgres real.
jest.unstable_mockModule("../src/repositories/specialties-repository.js", () => ({
  specialtiesRepository: { findAll, findById, findByCode, findByNameNormalized, create, update }
}));

jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findById: findUserById }
}));

const { app } = await import("../src/app.js");

const buildSpecialty = (overrides: Partial<SpecialtyRecord> = {}): SpecialtyRecord => ({
  id: 1,
  code: "epidemiology",
  name: "Epidemiologia",
  nameNormalized: "epidemiologia",
  description: "",
  guidanceContext: "",
  isActive: true,
  createdAt: new Date("2026-09-01T12:00:00.000Z"),
  updatedAt: new Date("2026-09-01T12:00:00.000Z"),
  ...overrides
});

const buildAuthUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({
  id: 10,
  role: "admin",
  isActive: true,
  ...overrides
});

const tokenFor = (userId: number) => jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

describe("GET /api/admin/specialties", () => {
  beforeEach(() => {
    findAll.mockReset();
    findUserById.mockReset();
  });

  it("retorna 401 sem token", async () => {
    const response = await request(app).get("/api/admin/specialties");

    expect(response.status).toBe(401);
  });

  it("researcher não acessa o catálogo", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser({ id: 12, role: "researcher" }));

    const response = await request(app)
      .get("/api/admin/specialties")
      .set("Authorization", `Bearer ${tokenFor(12)}`);

    expect(response.status).toBe(403);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("admin lista com filtro de texto e status", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce([buildSpecialty()]);

    const response = await request(app)
      .get("/api/admin/specialties?query=epidemio&is_active=true&page=2&page_size=5")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ query: "epidemio", isActive: true, page: 2, pageSize: 5 });
    expect(response.body).toEqual([
      {
        id: 1,
        code: "epidemiology",
        name: "Epidemiologia",
        description: "",
        guidance_context: "",
        is_active: true,
        created_at: "2026-09-01T12:00:00.000Z",
        updated_at: "2026-09-01T12:00:00.000Z"
      }
    ]);
  });

  it("is_active=false não vira true por engano", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce([]);

    const response = await request(app)
      .get("/api/admin/specialties?is_active=false")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ query: undefined, isActive: false, page: 1, pageSize: 20 });
  });
});

describe("POST /api/admin/specialties", () => {
  beforeEach(() => {
    findByCode.mockReset();
    findByNameNormalized.mockReset();
    create.mockReset();
    findUserById.mockReset();
  });

  it("retorna 401 sem token", async () => {
    const response = await request(app).post("/api/admin/specialties").send({ code: "x", name: "X" });

    expect(response.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it("committee não consegue criar especialidade", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser({ id: 11, role: "committee" }));

    const response = await request(app)
      .post("/api/admin/specialties")
      .set("Authorization", `Bearer ${tokenFor(11)}`)
      .send({ code: "epidemiology", name: "Epidemiologia" });

    expect(response.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it("admin cria uma especialidade com dados válidos e recebe 201", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findByCode.mockResolvedValueOnce(null);
    findByNameNormalized.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildSpecialty());

    const response = await request(app)
      .post("/api/admin/specialties")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ code: "epidemiology", name: "Epidemiologia" });

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      code: "epidemiology",
      name: "Epidemiologia",
      nameNormalized: "epidemiologia",
      description: "",
      guidanceContext: ""
    });
    expect(response.body.code).toBe("epidemiology");
  });

  it("retorna 400 quando falta o nome", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());

    const response = await request(app)
      .post("/api/admin/specialties")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ code: "epidemiology" });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("retorna 409 quando o código já existe", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findByCode.mockResolvedValueOnce(buildSpecialty());

    const response = await request(app)
      .post("/api/admin/specialties")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ code: "epidemiology", name: "Outro nome" });

    expect(response.status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });

  it("retorna 409 quando o nome normalizado já existe, mesmo com case/espaços diferentes", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findByCode.mockResolvedValueOnce(null);
    findByNameNormalized.mockResolvedValueOnce(buildSpecialty());

    const response = await request(app)
      .post("/api/admin/specialties")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ code: "outro-codigo", name: " epidemiologia " });

    expect(response.status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/admin/specialties/:id", () => {
  beforeEach(() => {
    findById.mockReset();
    findByNameNormalized.mockReset();
    update.mockReset();
    findUserById.mockReset();
  });

  it("retorna 404 quando a especialidade não existe", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findById.mockResolvedValueOnce(null);

    const response = await request(app)
      .patch("/api/admin/specialties/999")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ description: "Nova descrição" });

    expect(response.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });

  it("admin edita a descrição sem mexer no nome", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findById.mockResolvedValueOnce(buildSpecialty());
    update.mockResolvedValueOnce(buildSpecialty({ description: "Nova descrição" }));

    const response = await request(app)
      .patch("/api/admin/specialties/1")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ description: "Nova descrição" });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(1, {
      name: undefined,
      nameNormalized: undefined,
      description: "Nova descrição",
      guidanceContext: undefined
    });
  });

  it("retorna 409 ao tentar renomear para um nome já usado por outra especialidade", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findById.mockResolvedValueOnce(buildSpecialty({ id: 1 }));
    findByNameNormalized.mockResolvedValueOnce(buildSpecialty({ id: 2 }));

    const response = await request(app)
      .patch("/api/admin/specialties/1")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ name: "Outro nome" });

    expect(response.status).toBe(409);
    expect(update).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/admin/specialties/:id/status", () => {
  beforeEach(() => {
    findById.mockReset();
    update.mockReset();
    findUserById.mockReset();
  });

  it("admin desativa uma especialidade", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findById.mockResolvedValueOnce(buildSpecialty());
    update.mockResolvedValueOnce(buildSpecialty({ isActive: false }));

    const response = await request(app)
      .patch("/api/admin/specialties/1/status")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ is_active: false });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(1, { isActive: false });
    expect(response.body.is_active).toBe(false);
  });

  it("retorna 400 quando is_active não é booleano", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());

    const response = await request(app)
      .patch("/api/admin/specialties/1/status")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ is_active: "sim" });

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });
});
