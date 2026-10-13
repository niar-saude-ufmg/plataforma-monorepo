import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import type {
  SpecialtyListFilter,
  SpecialtyListResult,
  SpecialtyRecord,
  UpdateSpecialtyData
} from "../src/repositories/specialties-repository.js";

process.env.SECRET_KEY = "test-secret";

type StoredUser = {
  id: number;
  role: UserRole;
  accountStatus: "pending" | "active" | "rejected" | "disabled";
};

const findAll = jest.fn<(filter: SpecialtyListFilter) => Promise<SpecialtyListResult>>();
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
  accountStatus: "active",
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

  it("retorna a primeira página com a contagem total e o total de páginas", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce({ items: [buildSpecialty()], total: 21 });

    const response = await request(app)
      .get("/api/admin/specialties")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ query: undefined, isActive: undefined, page: 1, pageSize: 20 });
    expect(response.body.pagination).toEqual({ page: 1, page_size: 20, total_items: 21, total_pages: 2 });
    expect(response.body.items).toHaveLength(1);
  });

  it("retorna página intermediária com filtro de texto e status", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce({ items: [buildSpecialty()], total: 12 });

    const response = await request(app)
      .get("/api/admin/specialties?query=epidemio&is_active=true&page=2&page_size=5")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ query: "epidemio", isActive: true, page: 2, pageSize: 5 });
    expect(response.body).toEqual({
      items: [
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
      ],
      pagination: { page: 2, page_size: 5, total_items: 12, total_pages: 3 }
    });
  });

  it("retorna uma página vazia sem perder a contagem total", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce({ items: [], total: 21 });

    const response = await request(app)
      .get("/api/admin/specialties?page=4&page_size=10")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [],
      pagination: { page: 4, page_size: 10, total_items: 21, total_pages: 3 }
    });
  });

  it("is_active=false não vira true por engano", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findAll.mockResolvedValueOnce({ items: [], total: 0 });

    const response = await request(app)
      .get("/api/admin/specialties?is_active=false")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ query: undefined, isActive: false, page: 1, pageSize: 20 });
    expect(response.body.pagination.total_pages).toBe(0);
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

  it("retorna 400 quando código ou nome contêm apenas espaços", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());

    const response = await request(app)
      .post("/api/admin/specialties")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ code: "   ", name: "   " });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("remove espaços externos antes de validar e persistir código e nome", async () => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findByCode.mockResolvedValueOnce(null);
    findByNameNormalized.mockResolvedValueOnce(null);
    create.mockResolvedValueOnce(buildSpecialty({ code: "epi", name: "Epidemiologia" }));

    const response = await request(app)
      .post("/api/admin/specialties")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ code: "  epi  ", name: "  Epidemiologia  " });

    expect(response.status).toBe(201);
    expect(findByCode).toHaveBeenCalledWith("epi");
    expect(findByNameNormalized).toHaveBeenCalledWith("epidemiologia");
    expect(create).toHaveBeenCalledWith({
      code: "epi",
      name: "Epidemiologia",
      nameNormalized: "epidemiologia",
      description: "",
      guidanceContext: ""
    });
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

  it.each([true, false])("admin altera o status da especialidade para %s", async (isActive) => {
    findUserById.mockResolvedValueOnce(buildAuthUser());
    findById.mockResolvedValueOnce(buildSpecialty({ isActive: !isActive }));
    update.mockResolvedValueOnce(buildSpecialty({ isActive }));

    const response = await request(app)
      .patch("/api/admin/specialties/1/status")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ is_active: isActive });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(1, { isActive });
    expect(response.body.is_active).toBe(isActive);
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
