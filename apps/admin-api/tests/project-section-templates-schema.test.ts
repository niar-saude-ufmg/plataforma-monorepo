import {
  createProjectSectionTemplateSchema,
  definitionSchema,
  listProjectSectionTemplatesQuerySchema,
  projectSectionTemplateIdParamSchema,
  updateProjectSectionTemplateSchema
} from "../src/schemas/project-section-templates-schema.js";
import { projectSectionTemplateInput } from "./fixtures/project-section-templates.js";

const PROJECT_SECTION_TEMPLATE_SCHEMA_VERSION = 1;

const section = {
  key: "objetivo",
  label: "Objetivo",
  guidance: ["Descreva o objetivo."],
  prompt: "Qual é o objetivo?",
  required: true
};

const withSection = (value: unknown) => ({
  ...projectSectionTemplateInput,
  definition_json: {
    ...projectSectionTemplateInput.definition_json,
    sections: [value]
  }
});

const withDefinition = (value: unknown) => ({
  ...projectSectionTemplateInput,
  definition_json: value
});

describe("contrato do template de seção de projeto", () => {
  describe("caminho feliz", () => {
    it("aceita um template completo válido", () => {
      expect(createProjectSectionTemplateSchema.safeParse(projectSectionTemplateInput).success).toBe(true);
    });

    it("aceita a versão de schema compartilhada", () => {
      expect(definitionSchema.safeParse({
        schema_version: PROJECT_SECTION_TEMPLATE_SCHEMA_VERSION,
        sections: [section]
      }).success).toBe(true);
    });

    it("aceita seção sem prompt e aplica o valor padrão vazio", () => {
      const parsed = createProjectSectionTemplateSchema.parse(
        withSection({ key: "resumo", label: "Resumo", guidance: [], required: false })
      );
      expect(parsed.definition_json.sections[0].prompt).toBe("");
    });

    it("normaliza os textos com trim e mantém a ordem das seções", () => {
      const parsed = createProjectSectionTemplateSchema.parse({
        template_key: "  projeto_social  ",
        name: "  Template de projeto  ",
        definition_json: {
          schema_version: 1,
          sections: [
            { key: "  objetivo  ", label: "  Objetivo  ", guidance: ["  guia  "], prompt: "  pergunta  ", required: true },
            { key: "publico_alvo", label: "Público-alvo", guidance: ["guia"], required: false }
          ]
        }
      });

      expect(parsed.template_key).toBe("projeto_social");
      expect(parsed.name).toBe("Template de projeto");
      expect(parsed.definition_json.sections[0].key).toBe("objetivo");
      expect(parsed.definition_json.sections[0].label).toBe("Objetivo");
      expect(parsed.definition_json.sections[0].guidance).toEqual(["guia"]);
      expect(parsed.definition_json.sections[0].prompt).toBe("pergunta");
      expect(parsed.definition_json.sections[1].key).toBe("publico_alvo");
    });

    it("aceita o payload de edição sem a identificação", () => {
      expect(updateProjectSectionTemplateSchema.safeParse({
        name: "Novo nome",
        definition_json: projectSectionTemplateInput.definition_json
      }).success).toBe(true);
    });
  });

  describe("erros de validação", () => {
    it("rejeita template_key ausente", () => {
      const { template_key, ...rest } = projectSectionTemplateInput;
      expect(createProjectSectionTemplateSchema.safeParse(rest).success).toBe(false);
    });

    it.each(["Com Acentos", "ação", "id espaço", "_inicio", "1inicio", "abc_"])(
      "rejeita template_key %s",
      (template_key) => {
        expect(createProjectSectionTemplateSchema.safeParse({ ...projectSectionTemplateInput, template_key }).success).toBe(false);
      }
    );

    it("rejeita template_key vazio", () => {
      expect(createProjectSectionTemplateSchema.safeParse({ ...projectSectionTemplateInput, template_key: "   " }).success).toBe(false);
    });

    it("rejeita name ausente", () => {
      const { name, ...rest } = projectSectionTemplateInput;
      expect(createProjectSectionTemplateSchema.safeParse(rest).success).toBe(false);
    });

    it("rejeita name vazio", () => {
      expect(createProjectSectionTemplateSchema.safeParse({ ...projectSectionTemplateInput, name: "   " }).success).toBe(false);
    });

    it("rejeita definition_json ausente", () => {
      const { definition_json, ...rest } = projectSectionTemplateInput;
      expect(createProjectSectionTemplateSchema.safeParse(rest).success).toBe(false);
    });

    it.each([0, -1, 1.5, "1"])("rejeita schema_version inválida %s", (schema_version) => {
      expect(definitionSchema.safeParse({ schema_version, sections: [section] }).success).toBe(false);
    });

    it("rejeita schema_version ausente", () => {
      expect(definitionSchema.safeParse({ sections: [section] }).success).toBe(false);
    });

    it("rejeita definição sem seções", () => {
      expect(definitionSchema.safeParse({ schema_version: 1, sections: [] }).success).toBe(false);
      expect(definitionSchema.safeParse({ schema_version: 1 }).success).toBe(false);
    });

    it.each(["Com Acentos", "ação", "_inicio"])("rejeita key de seção %s", (key) => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, key })).success).toBe(false);
    });

    it("rejeita key de seção acima de 50 caracteres", () => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, key: "a".repeat(51) })).success).toBe(false);
    });

    it("rejeita label vazio", () => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, label: "   " })).success).toBe(false);
    });

    it("rejeita label acima de 255 caracteres", () => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, label: "a".repeat(256) })).success).toBe(false);
    });

    it("rejeita guidance que não é lista", () => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, guidance: "guia" })).success).toBe(false);
    });

    it("rejeita guidance com item vazio", () => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, guidance: ["objetivo", "  "] })).success).toBe(false);
    });

    it("rejeita guidance com item que não é texto", () => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, guidance: [1] })).success).toBe(false);
    });

    it("rejeita prompt que não é texto", () => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, prompt: 1 })).success).toBe(false);
    });

    it("rejeita required ausente", () => {
      const { required, ...rest } = section;
      expect(createProjectSectionTemplateSchema.safeParse(withSection(rest)).success).toBe(false);
    });

    it("rejeita required que não é booleano", () => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, required: "true" })).success).toBe(false);
    });

    it("rejeita campos extras na seção", () => {
      expect(createProjectSectionTemplateSchema.safeParse(withSection({ ...section, extra: true })).success).toBe(false);
    });

    it("rejeita campos extras na definição", () => {
      expect(createProjectSectionTemplateSchema.safeParse(
        withDefinition({ schema_version: 1, sections: [section], extra: true })
      ).success).toBe(false);
    });

    it("não aceita versão nem estado de publicação na criação", () => {
      expect(createProjectSectionTemplateSchema.safeParse({ ...projectSectionTemplateInput, version: 1 }).success).toBe(false);
      expect(createProjectSectionTemplateSchema.safeParse({ ...projectSectionTemplateInput, is_active: true }).success).toBe(false);
    });

    it("não aceita a identificação na edição", () => {
      expect(updateProjectSectionTemplateSchema.safeParse(projectSectionTemplateInput).success).toBe(false);
    });

    it("rejeita keys de seção duplicadas", () => {
      const input = withDefinition({
        schema_version: 1,
        sections: [
          { ...section, key: "objetivo" },
          { ...section, key: "objetivo", label: "Outro objetivo" }
        ]
      });
      expect(createProjectSectionTemplateSchema.safeParse(input).success).toBe(false);
    });
  });

  describe("identificador e consulta", () => {
    it("converte o id textual para número", () => {
      expect(projectSectionTemplateIdParamSchema.parse({ id: "5" })).toEqual({ id: 5 });
    });

    it.each([0, -1, 1.5, "abc"])("rejeita id inválido %s", (id) => {
      expect(projectSectionTemplateIdParamSchema.safeParse({ id }).success).toBe(false);
    });

    it("aplica os defaults da paginação", () => {
      expect(listProjectSectionTemplatesQuerySchema.parse({})).toEqual({ page: 1, page_size: 20 });
    });

    it("converte os parâmetros de consulta", () => {
      expect(listProjectSectionTemplatesQuerySchema.parse({
        template_key: "projeto_social",
        is_active: "true",
        page: "2",
        page_size: "10"
      })).toEqual({ template_key: "projeto_social", is_active: true, page: 2, page_size: 10 });
    });

    it("rejeita is_active fora de true/false", () => {
      expect(listProjectSectionTemplatesQuerySchema.safeParse({ is_active: "sim" }).success).toBe(false);
    });

    it("rejeita page_size acima de 100", () => {
      expect(listProjectSectionTemplatesQuerySchema.safeParse({ page_size: "101" }).success).toBe(false);
    });

    it("rejeita template_key inválido na consulta", () => {
      expect(listProjectSectionTemplatesQuerySchema.safeParse({ template_key: "Com Acentos" }).success).toBe(false);
    });
  });
});
