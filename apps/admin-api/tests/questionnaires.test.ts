import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../src/errors/app-error.js";
import type { QuestionnaireRecord } from "../src/repositories/questionnaires-repository.js";
import { questionnaireInput } from "./fixtures/questionnaires.js";

process.env.SECRET_KEY = "test-secret";

type StoredUser = { id: number; email: string; fullName: string; role: UserRole; accountStatus: "active" };
const findAll = jest.fn<() => Promise<{ items: QuestionnaireRecord[]; total: number }>>();
const findById = jest.fn<(id: number) => Promise<QuestionnaireRecord | null>>();
const create = jest.fn<(data: unknown) => Promise<QuestionnaireRecord>>();
const update = jest.fn<(id: number, data: unknown) => Promise<QuestionnaireRecord>>();
const publish = jest.fn<(id: number) => Promise<QuestionnaireRecord>>();
const findUserById = jest.fn<(id: number) => Promise<StoredUser | null>>();

jest.unstable_mockModule("../src/repositories/questionnaires-repository.js", () => ({
  questionnairesRepository: { findAll, findById, create, update, publish }
}));
jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findById: findUserById }
}));

const { app } = await import("../src/app.js");
const token = jwt.sign({ sub: "10" }, process.env.SECRET_KEY, { algorithm: "HS256" });
const user = (role: UserRole = "admin"): StoredUser => ({
  id: 10, email: "admin@niar.local", fullName: "Administrador", role, accountStatus: "active"
});
const record = (overrides: Partial<QuestionnaireRecord> = {}): QuestionnaireRecord => ({
  id: 1, questionnaireKey: questionnaireInput.key, version: 1, title: questionnaireInput.title,
  definitionJson: { ...questionnaireInput, version: 1 }, isActive: false, publishedAt: null,
  createdAt: new Date("2026-10-22T12:00:00.000Z"), updatedAt: new Date("2026-10-22T12:00:00.000Z"),
  ...overrides
});

beforeEach(() => {
  jest.resetAllMocks();
  findUserById.mockResolvedValue(user());
});

describe("questionnaire API", () => {
  it("exige autenticação", async () => {
    expect((await request(app).post("/api/admin/questionnaires").send(questionnaireInput)).status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it.each<UserRole>(["researcher", "committee", "auditor"])("impede gestão pelo perfil %s", async (role) => {
    findUserById.mockResolvedValue(user(role));
    const requests = [
      request(app).get("/api/admin/questionnaires"),
      request(app).get("/api/admin/questionnaires/1"),
      request(app).post("/api/admin/questionnaires").send(questionnaireInput),
      request(app).patch("/api/admin/questionnaires/1").send({ sections: questionnaireInput.sections }),
      request(app).post("/api/admin/questionnaires/1/publish")
    ];
    for (const operation of requests) expect((await operation.set("Authorization", `Bearer ${token}`)).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
  });

  it("cria seções dinâmicas sem answer_key e retorna a versão atribuída pelo servidor", async () => {
    create.mockResolvedValue(record());
    const response = await request(app).post("/api/admin/questionnaires")
      .set("Authorization", `Bearer ${token}`).send(questionnaireInput);
    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith(questionnaireInput);
    expect(response.body).toMatchObject({ key: questionnaireInput.key, version: 1, is_active: false, published_at: null });
    expect(response.body.definition_json).toEqual({ ...questionnaireInput, version: 1 });
  });

  it("aceita outro identificador de família", async () => {
    const input = { ...questionnaireInput, key: "outro_questionario" };
    create.mockResolvedValue(record({ questionnaireKey: input.key, definitionJson: { ...input, version: 1 } }));
    const response = await request(app).post("/api/admin/questionnaires").set("Authorization", `Bearer ${token}`).send(input);
    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith(input);
  });

  it("rejeita versão informada pelo cliente", async () => {
    const response = await request(app).post("/api/admin/questionnaires").set("Authorization", `Bearer ${token}`)
      .send({ ...questionnaireInput, version: 99 });
    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(["key", "title", "version", "is_active", "published_at"])("não permite mudar %s na edição", async (field) => {
    const response = await request(app).patch("/api/admin/questionnaires/1").set("Authorization", `Bearer ${token}`)
      .send({ sections: questionnaireInput.sections, [field]: "alterado" });
    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("edita somente as seções e mantém a versão", async () => {
    update.mockResolvedValue(record());
    const response = await request(app).patch("/api/admin/questionnaires/1").set("Authorization", `Bearer ${token}`)
      .send({ sections: questionnaireInput.sections });
    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(1, { sections: questionnaireInput.sections });
    expect(response.body.version).toBe(1);
  });

  it("propaga o bloqueio da edição de uma versão publicada, mesmo inativa", async () => {
    update.mockRejectedValue(new AppError("Uma versão já publicada não pode ser editada", 409));
    const response = await request(app).patch("/api/admin/questionnaires/1").set("Authorization", `Bearer ${token}`)
      .send({ sections: questionnaireInput.sections });
    expect(response.status).toBe(409);
  });

  it("lista com filtro de família e paginação", async () => {
    findAll.mockResolvedValue({ items: [record()], total: 21 });
    const response = await request(app).get("/api/admin/questionnaires?key=formulario_fiar&is_active=false&page=2&page_size=20")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith({ key: "formulario_fiar", isActive: false, page: 2, pageSize: 20 });
    expect(response.body.pagination).toEqual({ page: 2, page_size: 20, total_items: 21, total_pages: 2 });
  });

  it("consulta a definição completa para visualizar ou copiar", async () => {
    findById.mockResolvedValue(record());
    const response = await request(app).get("/api/admin/questionnaires/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.definition_json.sections).toEqual(questionnaireInput.sections);
  });

  it("retorna 404 ao consultar uma versão inexistente", async () => {
    findById.mockResolvedValue(null);
    expect((await request(app).get("/api/admin/questionnaires/10").set("Authorization", `Bearer ${token}`)).status).toBe(404);
  });

  it("publica e retorna a data de publicação", async () => {
    publish.mockResolvedValue(record({ isActive: true, publishedAt: new Date("2026-10-22T13:00:00.000Z") }));
    const response = await request(app).post("/api/admin/questionnaires/1/publish").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(publish).toHaveBeenCalledWith(1);
    expect(response.body.published_at).toBe("2026-10-22T13:00:00.000Z");
  });

  it.each(["0", "-1", "abc"])("rejeita id inválido %s", async (id) => {
    expect((await request(app).get(`/api/admin/questionnaires/${id}`).set("Authorization", `Bearer ${token}`)).status).toBe(400);
  });

  it.each(["page=0", "page_size=101", "is_active=maybe"])("rejeita filtro inválido %s", async (query) => {
    expect((await request(app).get(`/api/admin/questionnaires?${query}`).set("Authorization", `Bearer ${token}`)).status).toBe(400);
  });
});
