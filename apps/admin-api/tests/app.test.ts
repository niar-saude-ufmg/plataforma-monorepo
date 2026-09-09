import { jest } from "@jest/globals";
import request from "supertest";

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
  });
  
  it("expõe os três papéis do domínio, com admin rotulado como Gestor", async () => {
    const response = await request(app).get("/api/admin/meta");

    expect(response.body.userRoles).toEqual({
      researcher: "Pesquisador",
      admin: "Gestor",
      committee: "Comissão"
    });
  });
});
