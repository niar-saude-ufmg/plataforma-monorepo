import request from "supertest";
import { app } from "../src/app.js";

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
    expect(response.body.userRoles.admin).toBe("Admin");
    expect(response.body.projectStatuses.draft).toBe("Rascunho");
  });
});
