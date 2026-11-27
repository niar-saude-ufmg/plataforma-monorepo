import { jest } from "@jest/globals";
import { projectSectionTemplateDefinition, projectSectionTemplateInput } from "./fixtures/project-section-templates.js";

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

const findAll = jest.fn<(filter: unknown) => Promise<{ items: TemplateRecord[]; total: number }>>();
const findById = jest.fn<(id: number) => Promise<TemplateRecord | null>>();
const create = jest.fn<(input: unknown) => Promise<TemplateRecord>>();
const update = jest.fn<(id: number, input: unknown) => Promise<TemplateRecord>>();
const publish = jest.fn<(id: number) => Promise<TemplateRecord>>();

jest.unstable_mockModule("../src/repositories/project-section-templates-repository.js", () => ({
  projectSectionTemplatesRepository: { findAll, findById, create, update, publish }
}));

const { projectSectionTemplatesService } = await import("../src/services/project-section-templates-service.js");

const createdAt = new Date("2026-10-21T09:00:00.000Z");
const updatedAt = new Date("2026-10-22T12:00:00.000Z");

const record = (overrides: Partial<TemplateRecord> = {}): TemplateRecord => ({
  id: 1,
  templateKey: projectSectionTemplateInput.template_key,
  version: 1,
  name: projectSectionTemplateInput.name,
  definitionJson: projectSectionTemplateInput.definition_json,
  isActive: false,
  publishedAt: null,
  createdAt,
  updatedAt,
  ...overrides
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe("projectSectionTemplatesService", () => {
  describe("listProjectSectionTemplates", () => {
    it("repassa filtros e paginação e monta a resposta", async () => {
      findAll.mockResolvedValue({ items: [record()], total: 21 });

      const result = await projectSectionTemplatesService.listProjectSectionTemplates({
        template_key: "projeto_social",
        is_active: false,
        page: 2,
        page_size: 20
      });

      expect(findAll).toHaveBeenCalledWith({
        templateKey: "projeto_social",
        isActive: false,
        page: 2,
        pageSize: 20
      });
      expect(result.pagination).toEqual({ page: 2, page_size: 20, total_items: 21, total_pages: 2 });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        id: 1,
        template_key: projectSectionTemplateInput.template_key,
        name: projectSectionTemplateInput.name,
        version: 1,
        definition_json: projectSectionTemplateDefinition,
        is_active: false,
        published_at: null,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString()
      });
    });

    it("arredonda total_pages para cima e aceita lista vazia", async () => {
      findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await projectSectionTemplatesService.listProjectSectionTemplates({ page: 1, page_size: 20 });

      expect(result.items).toEqual([]);
      expect(result.pagination).toEqual({ page: 1, page_size: 20, total_items: 0, total_pages: 0 });
    });
  });

  describe("getProjectSectionTemplate", () => {
    it("retorna a versão mapeada", async () => {
      findById.mockResolvedValue(record());

      const result = await projectSectionTemplatesService.getProjectSectionTemplate(1);

      expect(findById).toHaveBeenCalledWith(1);
      expect(result.template_key).toBe(projectSectionTemplateInput.template_key);
      expect(result.definition_json).toEqual(projectSectionTemplateDefinition);
    });

    it("lança 404 quando a versão não existe", async () => {
      findById.mockResolvedValue(null);

      await expect(projectSectionTemplatesService.getProjectSectionTemplate(99))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it("preserva a data de publicação de uma versão histórica inativa", async () => {
      findById.mockResolvedValue(record({
        isActive: false,
        publishedAt: new Date("2026-10-22T12:30:00.000Z")
      }));

      const result = await projectSectionTemplatesService.getProjectSectionTemplate(1);

      expect(result.published_at).toBe("2026-10-22T12:30:00.000Z");
    });
  });

  describe("createProjectSectionTemplate", () => {
    it("repassa o input e mapeia o registro criado", async () => {
      create.mockResolvedValue(record());

      const result = await projectSectionTemplatesService.createProjectSectionTemplate(projectSectionTemplateInput);

      expect(create).toHaveBeenCalledWith(projectSectionTemplateInput);
      expect(result).toMatchObject({ id: 1, version: 1, is_active: false, published_at: null });
      expect(result.definition_json).toEqual(projectSectionTemplateDefinition);
    });
  });

  describe("updateProjectSectionTemplate", () => {
    it("repassa id e input e mapeia o registro atualizado", async () => {
      const input = { name: "Novo nome", definition_json: projectSectionTemplateInput.definition_json };
      update.mockResolvedValue(record({ name: "Novo nome" }));

      const result = await projectSectionTemplatesService.updateProjectSectionTemplate(1, input);

      expect(update).toHaveBeenCalledWith(1, input);
      expect(result.name).toBe("Novo nome");
    });
  });

  describe("publishProjectSectionTemplate", () => {
    it("expõe a data de publicação a partir da atualização do registro", async () => {
      publish.mockResolvedValue(record({
        isActive: true,
        publishedAt: new Date("2026-10-22T12:30:00.000Z"),
        updatedAt: new Date("2026-10-22T13:00:00.000Z")
      }));

      const result = await projectSectionTemplatesService.publishProjectSectionTemplate(1);

      expect(publish).toHaveBeenCalledWith(1);
      expect(result.is_active).toBe(true);
      expect(result.published_at).toBe("2026-10-22T12:30:00.000Z");
    });
  });
});
