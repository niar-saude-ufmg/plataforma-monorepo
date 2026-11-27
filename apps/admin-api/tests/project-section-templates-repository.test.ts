import { jest } from "@jest/globals";
import { projectSectionTemplateDefinition as parsedDefinition, projectSectionTemplateInput } from "./fixtures/project-section-templates.js";

type TemplateRecord = {
  id: number;
  templateKey: string;
  version: number;
  name: string;
  definitionJson: unknown;
  isActive: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const findUnique = jest.fn<(args: unknown) => Promise<TemplateRecord | null>>();
const findFirst = jest.fn<(args: unknown) => Promise<TemplateRecord | null>>();
const create = jest.fn<(args: unknown) => Promise<TemplateRecord>>();
const update = jest.fn<(args: unknown) => Promise<TemplateRecord>>();
const updateMany = jest.fn<(args: unknown) => Promise<{ count: number }>>();
const findMany = jest.fn<(args: unknown) => Promise<TemplateRecord[]>>();
const count = jest.fn<(args: unknown) => Promise<number>>();

const client = { projectSectionTemplate: { findUnique, findFirst, create, update, updateMany, findMany, count } };
const transaction = jest.fn(async (operation: ((tx: typeof client) => Promise<unknown>) | Promise<unknown>[], _options?: unknown) =>
  typeof operation === "function" ? operation(client) : Promise.all(operation));

class PrismaClientKnownRequestError extends Error {
  constructor(public code: string) { super(code); }
}

jest.unstable_mockModule("@niar/database", () => ({
  prisma: { ...client, $transaction: transaction },
  Prisma: { PrismaClientKnownRequestError }
}));

const { projectSectionTemplatesRepository } = await import("../src/repositories/project-section-templates-repository.js");

const updateInput = { name: "Novo nome", definition_json: projectSectionTemplateInput.definition_json };

const record = (overrides: Partial<TemplateRecord> = {}): TemplateRecord => ({
  id: 1,
  templateKey: projectSectionTemplateInput.template_key,
  version: 1,
  name: projectSectionTemplateInput.name,
  definitionJson: parsedDefinition,
  isActive: false,
  publishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

beforeEach(() => {
  jest.clearAllMocks();
  findUnique.mockReset();
  findFirst.mockReset();
  create.mockReset();
  update.mockReset();
  updateMany.mockReset();
  findMany.mockReset();
  count.mockReset();
  findFirst.mockResolvedValue(null);
  create.mockResolvedValue(record());
  update.mockResolvedValue(record());
  updateMany.mockResolvedValue({ count: 1 });
});

describe("projectSectionTemplatesRepository", () => {
  describe("create", () => {
    it("começa cada grupo em 1 dentro de transação serializável", async () => {
      await projectSectionTemplatesRepository.create(projectSectionTemplateInput);

      expect(transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
      expect(findFirst).toHaveBeenCalledWith({
        where: { templateKey: projectSectionTemplateInput.template_key },
        orderBy: { version: "desc" }
      });
      expect(create).toHaveBeenCalledWith({
        data: {
          templateKey: projectSectionTemplateInput.template_key,
          name: projectSectionTemplateInput.name,
          version: 1,
          definitionJson: parsedDefinition
        }
      });
    });

    it("incrementa a versão a partir da última salva", async () => {
      findFirst.mockResolvedValue(record({ version: 9 }));

      await projectSectionTemplatesRepository.create(projectSectionTemplateInput);

      expect(create).toHaveBeenCalledWith({
        data: expect.objectContaining({ version: 10, definitionJson: parsedDefinition })
      });
    });

    it.each(["P2034", "P2002"])("recalcula a versão após conflito %s", async (code) => {
      findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(record({ version: 1 }));
      create
        .mockRejectedValueOnce(new PrismaClientKnownRequestError(code))
        .mockResolvedValueOnce(record({ version: 2 }));

      const created = await projectSectionTemplatesRepository.create(projectSectionTemplateInput);

      expect(created.version).toBe(2);
      expect(create).toHaveBeenLastCalledWith({ data: expect.objectContaining({ version: 2 }) });
      expect(transaction).toHaveBeenCalledTimes(2);
    });

    it("limita tentativas de concorrência e preserva outros erros", async () => {
      create.mockRejectedValue(new PrismaClientKnownRequestError("P2034"));

      await expect(projectSectionTemplatesRepository.create(projectSectionTemplateInput))
        .rejects.toMatchObject({ statusCode: 409 });
      expect(transaction).toHaveBeenCalledTimes(3);

      create.mockRejectedValue(new Error("database unavailable"));

      await expect(projectSectionTemplatesRepository.create(projectSectionTemplateInput))
        .rejects.toThrow("database unavailable");
    });
  });

  describe("update", () => {
    it("edita nome e definição enquanto rascunho", async () => {
      findUnique.mockResolvedValue(record());

      await projectSectionTemplatesRepository.update(1, updateInput);

      expect(update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "Novo nome", definitionJson: parsedDefinition, updatedAt: expect.any(Date) }
      });
    });

    it("não edita template ativo nem uma versão já publicada", async () => {
      findUnique.mockResolvedValueOnce(record({ isActive: true, publishedAt: null }));
      await expect(projectSectionTemplatesRepository.update(1, updateInput))
        .rejects.toMatchObject({ statusCode: 409 });

      findUnique.mockResolvedValueOnce(record({ isActive: false, publishedAt: new Date() }));
      await expect(projectSectionTemplatesRepository.update(1, updateInput))
        .rejects.toMatchObject({ statusCode: 409 });

      expect(update).not.toHaveBeenCalled();
    });

    it("retorna 404 para edição inexistente", async () => {
      findUnique.mockResolvedValue(null);

      await expect(projectSectionTemplatesRepository.update(99, updateInput))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it("relê o estado após conflito entre edição e publicação", async () => {
      findUnique
        .mockResolvedValueOnce(record())
        .mockResolvedValueOnce(record({ isActive: true, publishedAt: new Date() }));
      update.mockRejectedValueOnce(new PrismaClientKnownRequestError("P2034"));

      await expect(projectSectionTemplatesRepository.update(1, updateInput))
        .rejects.toMatchObject({ statusCode: 409 });
      expect(update).toHaveBeenCalledTimes(1);
    });
  });

  describe("publish", () => {
    it("publica desativando somente a versão ativa da mesma templateKey", async () => {
      findUnique.mockResolvedValue(record());

      await projectSectionTemplatesRepository.publish(1);

      expect(updateMany).toHaveBeenCalledWith({
        where: { templateKey: projectSectionTemplateInput.template_key, isActive: true, id: { not: 1 } },
        data: { isActive: false, updatedAt: expect.any(Date) }
      });
      expect(update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: true, publishedAt: expect.any(Date), updatedAt: expect.any(Date) }
      });
    });

    it("é idempotente ao publicar novamente o template já ativo", async () => {
      const current = record({ isActive: true, publishedAt: new Date("2026-10-22T12:00:00Z") });
      findUnique.mockResolvedValue(current);

      expect(await projectSectionTemplatesRepository.publish(1)).toBe(current);
      expect(update).not.toHaveBeenCalled();
      expect(updateMany).not.toHaveBeenCalled();
    });

    it("não reativa uma versão histórica já publicada", async () => {
      findUnique.mockResolvedValue(record({ isActive: false, publishedAt: new Date() }));

      await expect(projectSectionTemplatesRepository.publish(1))
        .rejects.toMatchObject({ statusCode: 409 });
      expect(updateMany).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });

    it("revalida o JSON persistido antes de publicar", async () => {
      findUnique.mockResolvedValue(record({ definitionJson: { schema_version: 0, sections: [] } }));

      await expect(projectSectionTemplatesRepository.publish(1)).rejects.toThrow();
      expect(updateMany).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });

    it("retorna 404 para publicação inexistente", async () => {
      findUnique.mockResolvedValue(null);

      await expect(projectSectionTemplatesRepository.publish(99))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("findAll", () => {
    it("ordena por templateKey e versão desc aplicando paginação", async () => {
      findMany.mockResolvedValue([record({ version: 10 }), record({ version: 9 })]);
      count.mockResolvedValue(21);

      const result = await projectSectionTemplatesRepository.findAll({
        templateKey: "projeto_social",
        isActive: false,
        page: 2,
        pageSize: 20
      });

      const where = { templateKey: "projeto_social", isActive: false };
      expect(findMany).toHaveBeenCalledWith({
        where,
        orderBy: [{ templateKey: "asc" }, { version: "desc" }],
        skip: 20,
        take: 20
      });
      expect(count).toHaveBeenCalledWith({ where });
      expect(result.total).toBe(21);
      expect(result.items.map((item) => item.version)).toEqual([10, 9]);
    });

    it("aplica os filtros de templateKey e isActive", async () => {
      findMany.mockResolvedValue([]);
      count.mockResolvedValue(0);

      await projectSectionTemplatesRepository.findAll({
        templateKey: "projeto_social",
        isActive: true,
        page: 1,
        pageSize: 10
      });

      const where = { templateKey: "projeto_social", isActive: true };
      expect(findMany).toHaveBeenCalledWith({
        where,
        orderBy: [{ templateKey: "asc" }, { version: "desc" }],
        skip: 0,
        take: 10
      });
      expect(count).toHaveBeenCalledWith({ where });
    });

    it("omite os filtros não informados", async () => {
      findMany.mockResolvedValue([]);
      count.mockResolvedValue(0);

      await projectSectionTemplatesRepository.findAll({ page: 3, pageSize: 5 });

      const where = { templateKey: undefined, isActive: undefined };
      expect(findMany).toHaveBeenCalledWith({
        where,
        orderBy: [{ templateKey: "asc" }, { version: "desc" }],
        skip: 10,
        take: 5
      });
      expect(count).toHaveBeenCalledWith({ where });
    });
  });

  describe("findById", () => {
    it("busca diretamente pelo id", async () => {
      const expected = record();
      findUnique.mockResolvedValue(expected);

      expect(await projectSectionTemplatesRepository.findById(1)).toBe(expected);
      expect(findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
