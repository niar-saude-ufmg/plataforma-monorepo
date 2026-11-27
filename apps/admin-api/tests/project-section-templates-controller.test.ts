import { jest } from "@jest/globals";
import type { Request } from "express";
import { projectSectionTemplateDefinition, projectSectionTemplateInput } from "./fixtures/project-section-templates.js";

const listProjectSectionTemplates = jest.fn<(query: unknown) => Promise<unknown>>();
const getProjectSectionTemplate = jest.fn<(id: number) => Promise<unknown>>();
const createProjectSectionTemplate = jest.fn<(input: unknown) => Promise<unknown>>();
const updateProjectSectionTemplate = jest.fn<(id: number, input: unknown) => Promise<unknown>>();
const publishProjectSectionTemplate = jest.fn<(id: number) => Promise<unknown>>();

jest.unstable_mockModule("../src/services/project-section-templates-service.js", () => ({
  projectSectionTemplatesService: {
    listProjectSectionTemplates,
    getProjectSectionTemplate,
    createProjectSectionTemplate,
    updateProjectSectionTemplate,
    publishProjectSectionTemplate
  }
}));

const { projectSectionTemplatesController } = await import("../src/controllers/project-section-templates-controller.js");

type MockRequest = {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
};

const createRequest = (overrides: MockRequest = {}): Request =>
  ({ params: {}, query: {}, body: {}, ...overrides }) as unknown as Request;

const createResponse = () => {
  const response = {
    statusCode: 0,
    body: undefined as unknown,
    status: jest.fn<(code: number) => unknown>(),
    json: jest.fn<(payload: unknown) => unknown>()
  };
  response.status.mockImplementation((code) => {
    response.statusCode = code;
    return response;
  });
  response.json.mockImplementation((payload) => {
    response.body = payload;
    return response;
  });
  return response;
};

const createNext = () => jest.fn<(error?: unknown) => void>();

beforeEach(() => {
  jest.resetAllMocks();
});

describe("projectSectionTemplatesController", () => {
  describe("list", () => {
    it("aplica os defaults da query e responde 200", async () => {
      const payload = { items: [], pagination: { page: 1, page_size: 20, total_items: 0, total_pages: 0 } };
      listProjectSectionTemplates.mockResolvedValue(payload);
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.list(createRequest(), response as never, next);

      expect(listProjectSectionTemplates).toHaveBeenCalledWith({ page: 1, page_size: 20 });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(payload);
      expect(next).not.toHaveBeenCalled();
    });

    it("converte os parâmetros de query", async () => {
      listProjectSectionTemplates.mockResolvedValue({ items: [], pagination: {} });
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.list(
        createRequest({ query: { template_key: "projeto_social", is_active: "true", page: "2", page_size: "10" } }),
        response as never,
        next
      );

      expect(listProjectSectionTemplates).toHaveBeenCalledWith({
        template_key: "projeto_social",
        is_active: true,
        page: 2,
        page_size: 10
      });
      expect(response.statusCode).toBe(200);
    });

    it("encaminha query inválida para o próximo handler", async () => {
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.list(
        createRequest({ query: { is_active: "maybe" } }),
        response as never,
        next
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(response.status).not.toHaveBeenCalled();
      expect(listProjectSectionTemplates).not.toHaveBeenCalled();
    });

    it("encaminha erros do service", async () => {
      const error = new Error("falha na listagem");
      listProjectSectionTemplates.mockRejectedValue(error);
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.list(createRequest(), response as never, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(response.json).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("converte o id e responde 200", async () => {
      const payload = { id: 1 };
      getProjectSectionTemplate.mockResolvedValue(payload);
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.get(createRequest({ params: { id: "1" } }), response as never, next);

      expect(getProjectSectionTemplate).toHaveBeenCalledWith(1);
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(payload);
      expect(next).not.toHaveBeenCalled();
    });

    it("encaminha id inválido para o próximo handler", async () => {
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.get(createRequest({ params: { id: "abc" } }), response as never, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(getProjectSectionTemplate).not.toHaveBeenCalled();
      expect(response.status).not.toHaveBeenCalled();
    });

    it("encaminha erros do service", async () => {
      const error = new Error("não encontrado");
      getProjectSectionTemplate.mockRejectedValue(error);
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.get(createRequest({ params: { id: "1" } }), response as never, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("create", () => {
    it("valida o body e responde 201", async () => {
      const payload = { id: 1 };
      createProjectSectionTemplate.mockResolvedValue(payload);
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.create(
        createRequest({ body: projectSectionTemplateInput }),
        response as never,
        next
      );

      expect(createProjectSectionTemplate).toHaveBeenCalledWith({
        ...projectSectionTemplateInput,
        definition_json: projectSectionTemplateDefinition
      });
      expect(response.statusCode).toBe(201);
      expect(response.body).toBe(payload);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejeita body inválido", async () => {
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.create(
        createRequest({ body: { ...projectSectionTemplateInput, name: "   " } }),
        response as never,
        next
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(createProjectSectionTemplate).not.toHaveBeenCalled();
      expect(response.status).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("valida id e body e responde 200", async () => {
      const payload = { id: 1 };
      updateProjectSectionTemplate.mockResolvedValue(payload);
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.update(
        createRequest({
          params: { id: "1" },
          body: { name: "Novo nome", definition_json: projectSectionTemplateInput.definition_json }
        }),
        response as never,
        next
      );

      expect(updateProjectSectionTemplate).toHaveBeenCalledWith(1, {
        name: "Novo nome",
        definition_json: projectSectionTemplateDefinition
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(payload);
      expect(next).not.toHaveBeenCalled();
    });

    it("rejeita a identificação no body da edição", async () => {
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.update(
        createRequest({ params: { id: "1" }, body: projectSectionTemplateInput }),
        response as never,
        next
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(updateProjectSectionTemplate).not.toHaveBeenCalled();
      expect(response.status).not.toHaveBeenCalled();
    });

    it("rejeita id inválido", async () => {
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.update(
        createRequest({ params: { id: "0" }, body: { name: "Novo nome", definition_json: projectSectionTemplateInput.definition_json } }),
        response as never,
        next
      );

      expect(next).toHaveBeenCalledTimes(1);
      expect(updateProjectSectionTemplate).not.toHaveBeenCalled();
    });
  });

  describe("publish", () => {
    it("converte o id e responde 200", async () => {
      const payload = { id: 1, is_active: true };
      publishProjectSectionTemplate.mockResolvedValue(payload);
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.publish(
        createRequest({ params: { id: "1" } }),
        response as never,
        next
      );

      expect(publishProjectSectionTemplate).toHaveBeenCalledWith(1);
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(payload);
      expect(next).not.toHaveBeenCalled();
    });

    it("encaminha erros do service", async () => {
      const error = new Error("conflito ao publicar");
      publishProjectSectionTemplate.mockRejectedValue(error);
      const response = createResponse();
      const next = createNext();

      await projectSectionTemplatesController.publish(
        createRequest({ params: { id: "1" } }),
        response as never,
        next
      );

      expect(next).toHaveBeenCalledWith(error);
      expect(response.json).not.toHaveBeenCalled();
    });
  });
});
