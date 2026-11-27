import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../src/errors/app-error.js";
import type { ProjectSectionTemplateRecord } from "../src/repositories/project-section-templates-repository.js";
import { projectSectionTemplateDefinition, projectSectionTemplateInput } from "./fixtures/project-section-templates.js";

process.env.SECRET_KEY = "test-secret";

type StoredUser = { id: number; email: string; fullName: string; role: UserRole; accountStatus: "active" };
const findAll = jest.fn<(filter: unknown) => Promise<{ items: ProjectSectionTemplateRecord[]; total: number }>>();
const findById = jest.fn<(id: number) => Promise<ProjectSectionTemplateRecord | null>>();
const create = jest.fn<(data: unknown) => Promise<ProjectSectionTemplateRecord>>();
const update = jest.fn<(id: number, data: unknown) => Promise<ProjectSectionTemplateRecord>>();
const publish = jest.fn<(id: number) => Promise<ProjectSectionTemplateRecord>>();
const findUserById = jest.fn<(id: number) => Promise<StoredUser | null>>();

jest.unstable_mockModule("../src/repositories/project-section-templates-repository.js", () => ({
  projectSectionTemplatesRepository: { findAll, findById, create, update, publish }
}));
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findById: findUserById }
}));

const { app } = await import("../src/app.js");
const token = jwt.sign({ sub: "10" }, process.env.SECRET_KEY, { algorithm: "HS256" });
const user = (role: UserRole = "admin"): StoredUser => ({
  id: 10, email: "admin@niar.local", fullName: "Administrador", role, accountStatus: "active"
});
const record = (overrides: Partial<ProjectSectionTemplateRecord> = {}): ProjectSectionTemplateRecord => ({
  id: 1, templateKey: projectSectionTemplateInput.template_key, version: 1, name: projectSectionTemplateInput.name,
  definitionJson: projectSectionTemplateDefinition, isActive: false, publishedAt: null,
  createdAt: new Date("2026-10-22T12:00:00.000Z"), updatedAt: new Date("2026-10-22T12:00:00.000Z"),
  ...overrides
});
const updateInput = { name: "Novo nome", definition_json: projectSectionTemplateInput.definition_json };

beforeEach(() => {
  jest.resetAllMocks();
  findUserById.mockResolvedValue(user());
});

describe("project section template API", () => {
  it("exige autenticação", async () => {
    expect((await request(app).post("/api/admin/project-section-templates").send(projectSectionTemplateInput)).status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it.each<UserRole>(["researcher", "committee"])("impede gestão pelo perfil %s", async (role) => {
    findUserById.mockResolvedValue(user(role));
    const requests = [
      request(app).get("/api/admin/project-section-templates"),
      request(app).get("/api/admin/project-section-templates/1"),
      request(app).post("/api/admin/project-section-templates").send(projectSectionTemplateInput),
      request(app).put("/api/admin/project-section-templates/1").send(updateInput),
      request(app).post("/api/admin/project-section-templates/1/publish")
    ];
    for (const operation of requests) expect((await operation.set("Authorization", `Bearer ${token}`)).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it("cria a versão em rascunho e retorna a versão atribuída pelo servidor", async () => {
    create.mockResolvedValue(record());
    const response = await request(app).post("/api/admin/project-section-templates")
      .set("Authorization", `Bearer ${token}`).send(projectSectionTemplateInput);

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({ ...projectSectionTemplateInput, definition_json: projectSectionTemplateDefinition });
    expect(response.body).toMatchObject({
      id: 1,
      template_key: projectSectionTemplateInput.template_key,
      name: projectSectionTemplateInput.name,
      version: 1,
      is_active: false,
      published_at: null
    });
    expect(response.body.definition_json).toEqual(projectSectionTemplateDefinition);
  });

  it("aceita outro template_key de família", async () => {
    const input = { ...projectSectionTemplateInput, template_key: "outro_template" };
    create.mockResolvedValue(record({ templateKey: input.template_key }));
    const response = await request(app).post("/api/admin/project-section-templates")
      .set("Authorization", `Bearer ${token}`).send(input);

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({ ...input, definition_json: projectSectionTemplateDefinition });
    expect(response.body.template_key).toBe("outro_template");
  });

  it("rejeita versão informada pelo cliente", async () => {
    const response = await request(app).post("/api/admin/project-section-templates")
      .set("Authorization", `Bearer ${token}`).send({ ...projectSectionTemplateInput, version: 99 });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(["template_key", "version", "is_active", "published_at"])("não permite mudar %s na edição", async (field) => {
    const response = await request(app).put("/api/admin/project-section-templates/1")
      .set("Authorization", `Bearer ${token}`).send({ ...updateInput, [field]: "alterado" });

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("edita nome e definição mantendo a versão", async () => {
    update.mockResolvedValue(record({ name: "Novo nome" }));
    const response = await request(app).put("/api/admin/project-section-templates/1")
      .set("Authorization", `Bearer ${token}`).send(updateInput);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(1, { name: "Novo nome", definition_json: projectSectionTemplateDefinition });
    expect(response.body.name).toBe("Novo nome");
    expect(response.body.version).toBe(1);
  });

  it("propaga o bloqueio da edição de uma versão publicada", async () => {
    update.mockRejectedValue(new AppError("Um template já publicado não pode ser editado. Crie uma nova versão.", 409));
    const response = await request(app).put("/api/admin/project-section-templates/1")
      .set("Authorization", `Bearer ${token}`).send(updateInput);

    expect(response.status).toBe(409);
  });

  it("lista com filtro de família e paginação", async () => {
    findAll.mockResolvedValue({ items: [record()], total: 21 });
    const response = await request(app)
      .get("/api/admin/project-section-templates?template_key=projeto_social&is_active=false&page=2&page_size=20")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ templateKey: "projeto_social", isActive: false, page: 2, pageSize: 20 });
    expect(response.body.pagination).toEqual({ page: 2, page_size: 20, total_items: 21, total_pages: 2 });
  });

  it("consulta a definição completa para visualizar ou copiar", async () => {
    findById.mockResolvedValue(record());
    const response = await request(app).get("/api/admin/project-section-templates/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.definition_json.sections).toEqual(projectSectionTemplateDefinition.sections);
  });

  it("retorna 404 ao consultar uma versão inexistente", async () => {
    findById.mockResolvedValue(null);
    expect((await request(app).get("/api/admin/project-section-templates/10")
      .set("Authorization", `Bearer ${token}`)).status).toBe(404);
  });

  it("publica e retorna a data de publicação", async () => {
    publish.mockResolvedValue(record({
      isActive: true,
      publishedAt: new Date("2026-10-22T13:00:00.000Z"),
      updatedAt: new Date("2026-10-22T13:00:00.000Z")
    }));
    const response = await request(app).post("/api/admin/project-section-templates/1/publish")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(publish).toHaveBeenCalledWith(1);
    expect(response.body.is_active).toBe(true);
    expect(response.body.published_at).toBe("2026-10-22T13:00:00.000Z");
  });

  it("propaga o conflito de publicação de uma versão histórica", async () => {
    publish.mockRejectedValue(new AppError("Uma versão já publicada não pode ser republicada. Crie uma nova versão.", 409));
    const response = await request(app).post("/api/admin/project-section-templates/1/publish")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(409);
  });

  it.each(["0", "-1", "abc"])("rejeita id inválido %s", async (id) => {
    expect((await request(app).get(`/api/admin/project-section-templates/${id}`)
      .set("Authorization", `Bearer ${token}`)).status).toBe(400);
  });

  it.each(["page=0", "page_size=101", "is_active=maybe"])("rejeita filtro inválido %s", async (query) => {
    expect((await request(app).get(`/api/admin/project-section-templates?${query}`)
      .set("Authorization", `Bearer ${token}`)).status).toBe(400);
  });
});
