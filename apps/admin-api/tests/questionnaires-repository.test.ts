import { jest } from "@jest/globals";
import type { QuestionnaireRecord } from "../src/repositories/questionnaires-repository.js";
import { questionnaireInput } from "./fixtures/questionnaires.js";

const findUnique = jest.fn<(args: unknown) => Promise<QuestionnaireRecord | null>>();
const findFirst = jest.fn<(args: unknown) => Promise<QuestionnaireRecord | null>>();
const create = jest.fn<(args: unknown) => Promise<QuestionnaireRecord>>();
const update = jest.fn<(args: unknown) => Promise<QuestionnaireRecord>>();
const updateMany = jest.fn<(args: unknown) => Promise<{ count: number }>>();
const findMany = jest.fn<(args: unknown) => Promise<QuestionnaireRecord[]>>();
const count = jest.fn<(args: unknown) => Promise<number>>();
const client = { questionnaire: { findUnique, findFirst, create, update, updateMany, findMany, count } };
const transaction = jest.fn(async (operation: ((tx: typeof client) => Promise<unknown>) | Promise<unknown>[], _options?: unknown) =>
  typeof operation === "function" ? operation(client) : Promise.all(operation));

class PrismaClientKnownRequestError extends Error {
  constructor(public code: string) { super(code); }
}

jest.unstable_mockModule("@niar/database", () => ({
  prisma: { ...client, $transaction: transaction },
  Prisma: { PrismaClientKnownRequestError }
}));

const { questionnairesRepository } = await import("../src/repositories/questionnaires-repository.js");
const record = (overrides: Partial<QuestionnaireRecord> = {}): QuestionnaireRecord => ({
  id: 1, questionnaireKey: questionnaireInput.key, version: 1, title: questionnaireInput.title,
  definitionJson: { ...questionnaireInput, version: 1 }, isActive: false, publishedAt: null,
  createdAt: new Date(), updatedAt: new Date(), ...overrides
});

beforeEach(() => {
  jest.clearAllMocks();
  findFirst.mockReset(); create.mockReset(); update.mockReset(); findUnique.mockReset();
  findFirst.mockResolvedValue(null);
  create.mockResolvedValue(record()); update.mockResolvedValue(record());
  updateMany.mockResolvedValue({ count: 1 });
});

describe("questionnairesRepository", () => {
  it("começa cada família em 1 dentro de transação serializável", async () => {
    await questionnairesRepository.create(questionnaireInput);
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
    expect(findFirst).toHaveBeenCalledWith({ where: { questionnaireKey: questionnaireInput.key }, orderBy: { version: "desc" } });
    expect(create).toHaveBeenCalledWith({ data: {
      questionnaireKey: questionnaireInput.key, title: questionnaireInput.title, version: 1,
      definitionJson: { ...questionnaireInput, version: 1 }
    } });
  });

  it("gera 10 após 9, inclusive quando a última versão ainda está salva", async () => {
    findFirst.mockResolvedValue(record({ version: 9 }));
    await questionnairesRepository.create(questionnaireInput);
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ version: 10, definitionJson: { ...questionnaireInput, version: 10 } }) });
  });

  it("não permite trocar o título de uma família existente", async () => {
    findFirst.mockResolvedValue(record());
    await expect(questionnairesRepository.create({ ...questionnaireInput, title: "Outro título" })).rejects.toMatchObject({ statusCode: 400 });
    expect(create).not.toHaveBeenCalled();
  });

  it("não ultrapassa o limite numérico da versão", async () => {
    findFirst.mockResolvedValue(record({ version: 2147483647 }));
    await expect(questionnairesRepository.create(questionnaireInput)).rejects.toMatchObject({ statusCode: 409 });
    expect(create).not.toHaveBeenCalled();
  });

  it.each(["P2034", "P2002"])("recalcula a versão após conflito %s", async (code) => {
    findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(record({ version: 1 }));
    create.mockRejectedValueOnce(new PrismaClientKnownRequestError(code)).mockResolvedValueOnce(record({ version: 2 }));
    expect((await questionnairesRepository.create(questionnaireInput)).version).toBe(2);
    expect(create).toHaveBeenLastCalledWith({ data: expect.objectContaining({ version: 2 }) });
    expect(transaction).toHaveBeenCalledTimes(2);
  });

  it("limita tentativas de concorrência e preserva outros erros", async () => {
    create.mockRejectedValue(new PrismaClientKnownRequestError("P2034"));
    await expect(questionnairesRepository.create(questionnaireInput)).rejects.toMatchObject({ statusCode: 409 });
    expect(transaction).toHaveBeenCalledTimes(3);
    create.mockRejectedValue(new Error("database unavailable"));
    await expect(questionnairesRepository.create(questionnaireInput)).rejects.toThrow("database unavailable");
  });

  it("edita apenas o conteúdo mantendo toda a identificação", async () => {
    findUnique.mockResolvedValue(record());
    await questionnairesRepository.update(1, { sections: questionnaireInput.sections });
    expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: {
      definitionJson: { ...questionnaireInput, version: 1 }, updatedAt: expect.any(Date)
    } });
  });

  it.each([true, false])("não edita versão publicada, isActive=%s", async (isActive) => {
    findUnique.mockResolvedValue(record({ isActive, publishedAt: new Date() }));
    await expect(questionnairesRepository.update(1, { sections: questionnaireInput.sections })).rejects.toMatchObject({ statusCode: 409 });
    expect(update).not.toHaveBeenCalled();
  });

  it("publica desativando somente a versão ativa da mesma chave", async () => {
    findUnique.mockResolvedValue(record());
    await questionnairesRepository.publish(1);
    expect(updateMany).toHaveBeenCalledWith({ where: { questionnaireKey: questionnaireInput.key, isActive: true, id: { not: 1 } }, data: { isActive: false, updatedAt: expect.any(Date) } });
    expect(update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isActive: true, publishedAt: expect.any(Date), updatedAt: expect.any(Date) } });
  });

  it("é idempotente ao publicar novamente a versão ativa", async () => {
    const current = record({ isActive: true, publishedAt: new Date("2026-10-22T12:00:00Z") });
    findUnique.mockResolvedValue(current);
    expect(await questionnairesRepository.publish(1)).toBe(current);
    expect(update).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("não reativa uma versão histórica publicada", async () => {
    findUnique.mockResolvedValue(record({ publishedAt: new Date() }));
    await expect(questionnairesRepository.publish(1)).rejects.toMatchObject({ statusCode: 409 });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("revalida publicação e não publica metadados divergentes do JSON", async () => {
    findUnique.mockResolvedValue(record({ definitionJson: { ...questionnaireInput, version: 99 } }));
    await expect(questionnairesRepository.publish(1)).rejects.toMatchObject({ statusCode: 409 });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("relê o estado após conflito entre edição e publicação", async () => {
    findUnique.mockResolvedValueOnce(record()).mockResolvedValueOnce(record({ isActive: true, publishedAt: new Date() }));
    update.mockRejectedValueOnce(new PrismaClientKnownRequestError("P2034"));
    await expect(questionnairesRepository.update(1, { sections: questionnaireInput.sections })).rejects.toMatchObject({ statusCode: 409 });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("retorna 404 para edição ou publicação inexistente", async () => {
    findUnique.mockResolvedValue(null);
    await expect(questionnairesRepository.update(99, { sections: questionnaireInput.sections })).rejects.toMatchObject({ statusCode: 404 });
    await expect(questionnairesRepository.publish(99)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("ordena numericamente e usa os mesmos filtros na paginação e contagem", async () => {
    findMany.mockResolvedValue([record({ version: 10 }), record({ version: 9 })]); count.mockResolvedValue(21);
    const result = await questionnairesRepository.findAll({ key: "formulario_fiar", isActive: false, page: 2, pageSize: 20 });
    const where = { questionnaireKey: "formulario_fiar", isActive: false };
    expect(findMany).toHaveBeenCalledWith({ where, orderBy: [{ questionnaireKey: "asc" }, { version: "desc" }], skip: 20, take: 20 });
    expect(count).toHaveBeenCalledWith({ where });
    expect(result.total).toBe(21);
    expect(result.items.map((item) => item.version)).toEqual([10, 9]);
  });
});
