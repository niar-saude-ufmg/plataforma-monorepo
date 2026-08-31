import request from "supertest";
import { app } from "../src/app.js";

describe("Users API", () => {
  describe("POST /api/admin/users", () => {
    it("deve criar um usuário com dados válidos", async () => {
      const payload = {
        full_name: "Teste",
        email: "teste@niar.local.test",
        password: "senha12345",
        role: "researcher",
      };

      const response = await request(app)
        .post("/api/admin/users")
        .send(payload);

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        full_name: payload.full_name,
        email: payload.email,
        role: payload.role,
        is_active: true,
      });
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("created_at");
      expect(response.body).not.toHaveProperty("password");
      expect(response.body).not.toHaveProperty("hashed_password");
    });

    it("deve retornar 400 para dados inválidos (email inválido)", async () => {
      const response = await request(app)
        .post("/api/admin/users")
        .send({
          full_name: "Teste",
          email: "emailinvalido",
          password: "senha12345",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("deve retornar 400 para senha muito curta", async () => {
      const response = await request(app)
        .post("/api/admin/users")
        .send({
          full_name: "Teste",
          email: "teste@niar.local",
          password: "123",
          role: "researcher",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("deve retornar 409 para e-mail duplicado", async () => {
      await request(app)
        .post("/api/admin/users")
        .send({
          full_name: "A",
          email: "duplicado@niar.local",
          password: "senha12345",
          role: "researcher",
        });

      const response = await request(app)
        .post("/api/admin/users")
        .send({
          full_name: "B",
          email: "duplicado@niar.local",
          password: "outrasenha",
          role: "researcher",
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain("already exists");
    });
  });
});
