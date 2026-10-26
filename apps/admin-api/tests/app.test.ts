import { jest } from "@jest/globals";
import request from "supertest";

process.env.SECRET_KEY = "test-secret";

jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: {
    findAll: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn()
  }
}));

const { app } = await import("../src/app.js");

describe("admin api", () => {
  it("expõe healthcheck", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "admin-api"
    });
  });

  it("expõe metadados básicos do módulo", async () => {
    const response = await request(app).get("/api/admin/meta");

    expect(response.status).toBe(200);
    expect(response.body.module).toBe("admin");
    expect(response.body.projectStatuses.draft).toBe("Rascunho");
    expect(response.body.evaluationStatuses.waiting).toBe("Aguardando atribuição");
    expect(response.body.evaluationStatuses.to_review).toBe("Aguardando avaliação");
    expect(response.body.evaluationStatuses.approved_by_committee).toBe("Aprovado pelo comitê");
    expect(response.body.evaluationContexts.pre_safe_room).toBe("Pré-sala segura");
    expect(response.body.evaluationContexts.post_safe_room).toBe("Pós-sala segura");
  });
  
  it("expõe os papéis do domínio, com admin rotulado como Gestor", async () => {
    const response = await request(app).get("/api/admin/meta");

    expect(response.body.userRoles).toEqual({
      researcher: "Pesquisador",
      admin: "Gestor",
      auditor: "Auditor",
      committee: "Comitê"
    });
  });
});
