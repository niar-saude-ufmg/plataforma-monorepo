import { afterAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import jwt from "jsonwebtoken";
import request from "supertest";
import type { UserRole } from "@niar/contracts";
import type {
  CoepDocumentRecord,
  UserAuthEvaluationRecord,
  UserAuthEvaluationTarget
} from "../src/repositories/users-repository.js";

process.env.SECRET_KEY = "test-secret";
const exportsDirectory = mkdtempSync(path.join(tmpdir(), "niar-auth-evaluation-"));
process.env.EXPORTS_DIR = exportsDirectory;

type AccountStatus = "pending" | "active" | "rejected" | "disabled";
type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: AccountStatus;
};

const findById = jest.fn<(id: number) => Promise<AuthUser | null>>();
const findAuthEvaluationTarget = jest.fn<
  (id: number) => Promise<UserAuthEvaluationTarget | null>
>();
const createAuthEvaluation = jest.fn<
  (data: unknown) => Promise<UserAuthEvaluationRecord>
>();
const findCoepDocument = jest.fn<
  (id: number) => Promise<CoepDocumentRecord | null>
>();

jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: {
    findById,
    findAuthEvaluationTarget,
    createAuthEvaluation,
    findCoepDocument
  }
}));

const { app } = await import("../src/app.js");

const authUser = (id: number, role: UserRole): AuthUser => ({
  id,
  email: `${role}@niar.local`,
  fullName: role,
  role,
  accountStatus: "active"
});

const target = (accountStatus: AccountStatus = "pending"): UserAuthEvaluationTarget => ({
  id: 40,
  role: "researcher",
  accountStatus,
  researcherProfile: { userId: 40 }
});

const evaluation = (status: AccountStatus, actorId: number): UserAuthEvaluationRecord => ({
  id: 12,
  userId: 40,
  status,
  justification: status === "rejected" ? "Parecer inválido" : "Cadastro aprovado.",
  evaluatedByUserId: actorId,
  evaluatedAt: new Date("2026-10-05T12:00:00.000Z"),
  createdAt: new Date("2026-10-05T12:00:00.000Z"),
  userCoepDataId: 4
});

const tokenFor = (userId: number) =>
  jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  rmSync(exportsDirectory, { recursive: true, force: true });
});

describe("POST /api/admin/users/:user_id/auth-evaluation", () => {
  it.each([
    ["admin" as const, 10, "active" as const],
    ["admin" as const, 10, "rejected" as const],
    ["committee" as const, 11, "active" as const],
    ["committee" as const, 11, "rejected" as const]
  ])("permite que %s revise cadastro pendente", async (role, actorId, status) => {
    findById.mockResolvedValueOnce(authUser(actorId, role));
    findAuthEvaluationTarget.mockResolvedValueOnce(target());
    createAuthEvaluation.mockResolvedValueOnce(evaluation(status, actorId));

    const response = await request(app)
      .post("/api/admin/users/40/auth-evaluation")
      .set("Authorization", `Bearer ${tokenFor(actorId)}`)
      .send({ status, justification: status === "rejected" ? "Parecer inválido" : "Cadastro aprovado." });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      user_id: 40,
      status,
      evaluated_by_user_id: actorId,
      user_coep_data_id: 4
    });
    expect(createAuthEvaluation).toHaveBeenCalledWith({
      userId: 40,
      expectedStatus: "pending",
      status,
      justification: status === "rejected" ? "Parecer inválido" : "Cadastro aprovado.",
      evaluatedByUserId: actorId
    });
  });

  it("exige justificativa para rejeição", async () => {
    findById.mockResolvedValueOnce(authUser(10, "admin"));
    findAuthEvaluationTarget.mockResolvedValueOnce(target());

    const response = await request(app)
      .post("/api/admin/users/40/auth-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ status: "rejected" });

    expect(response.status).toBe(400);
    expect(createAuthEvaluation).not.toHaveBeenCalled();
  });

  it.each<[AccountStatus, AccountStatus]>([
    ["active", "disabled"],
    ["disabled", "active"],
    ["rejected", "active"],
    ["pending", "pending"]
  ])("bloqueia a transição %s -> %s", async (currentStatus, requestedStatus) => {
    findById.mockResolvedValueOnce(authUser(10, "admin"));
    findAuthEvaluationTarget.mockResolvedValueOnce(target(currentStatus));

    const response = await request(app)
      .post("/api/admin/users/40/auth-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ status: requestedStatus, justification: "Teste" });

    expect(response.status).toBe(409);
    expect(createAuthEvaluation).not.toHaveBeenCalled();
  });

  it("rejeita valor fora do enum compartilhado", async () => {
    findById.mockResolvedValueOnce(authUser(10, "admin"));

    const response = await request(app)
      .post("/api/admin/users/40/auth-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ status: "approved" });

    expect(response.status).toBe(400);
    expect(findAuthEvaluationTarget).not.toHaveBeenCalled();
  });

  it("retorna 404 para usuário inexistente", async () => {
    findById.mockResolvedValueOnce(authUser(10, "admin"));
    findAuthEvaluationTarget.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/admin/users/999/auth-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ status: "active" });

    expect(response.status).toBe(404);
  });

  it("bloqueia usuário sem perfil de pesquisador", async () => {
    findById.mockResolvedValueOnce(authUser(10, "admin"));
    findAuthEvaluationTarget.mockResolvedValueOnce({
      ...target(),
      role: "committee",
      researcherProfile: null
    });

    const response = await request(app)
      .post("/api/admin/users/11/auth-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ status: "active" });

    expect(response.status).toBe(400);
    expect(createAuthEvaluation).not.toHaveBeenCalled();
  });

  it("bloqueia pesquisador autenticado", async () => {
    findById.mockResolvedValueOnce(authUser(20, "researcher"));

    const response = await request(app)
      .post("/api/admin/users/40/auth-evaluation")
      .set("Authorization", `Bearer ${tokenFor(20)}`)
      .send({ status: "active" });

    expect(response.status).toBe(403);
    expect(findAuthEvaluationTarget).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/users/:user_id/coep-document", () => {
  const documentDirectory = path.join(exportsDirectory, "coep", "usuarios");
  const documentPath = path.join(documentDirectory, "documento.pdf");

  it.each(["admin", "committee"] as const)("permite download para %s", async (role) => {
    mkdirSync(documentDirectory, { recursive: true });
    writeFileSync(documentPath, "%PDF-1.7\nfixture");
    const actorId = role === "admin" ? 10 : 11;
    findById.mockResolvedValueOnce(authUser(actorId, role));
    findCoepDocument.mockResolvedValueOnce({
      role: "researcher",
      researcherProfile: { userId: 40 },
      coepData: [{
        documentFilename: "parecer original.pdf",
        documentStoragePath: documentPath
      }]
    });

    const response = await request(app)
      .get("/api/admin/users/40/coep-document")
      .set("Authorization", `Bearer ${tokenFor(actorId)}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toContain("parecer original.pdf");
  });

  it("bloqueia pesquisador autenticado", async () => {
    findById.mockResolvedValueOnce(authUser(20, "researcher"));

    const response = await request(app)
      .get("/api/admin/users/40/coep-document")
      .set("Authorization", `Bearer ${tokenFor(20)}`);

    expect(response.status).toBe(403);
    expect(findCoepDocument).not.toHaveBeenCalled();
  });

  it("retorna 404 quando o usuário não possui parecer", async () => {
    findById.mockResolvedValueOnce(authUser(10, "admin"));
    findCoepDocument.mockResolvedValueOnce(null);

    const response = await request(app)
      .get("/api/admin/users/999/coep-document")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(404);
  });

  it("impede acesso fora do diretório de exports sem expor o caminho", async () => {
    findById.mockResolvedValueOnce(authUser(10, "admin"));
    findCoepDocument.mockResolvedValueOnce({
      role: "researcher",
      researcherProfile: { userId: 40 },
      coepData: [{
        documentFilename: "parecer.pdf",
        documentStoragePath: "/etc/passwd"
      }]
    });

    const response = await request(app)
      .get("/api/admin/users/40/coep-document")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(404);
    expect(JSON.stringify(response.body)).not.toContain("/etc/passwd");
  });
});

describe("Swagger da revisão de cadastro", () => {
  it("documenta enum, transições e download", async () => {
    const response = await request(app).get("/api/admin/docs.json");
    const review = response.body.paths["/admin/users/{user_id}/auth-evaluation"].post;

    expect(review.requestBody.content["application/json"].schema.properties.status.enum)
      .toEqual(["pending", "active", "rejected", "disabled"]);
    expect(review.description).toContain("pending -> active");
    expect(review.description).toContain("pending -> rejected");
    expect(response.body.paths["/admin/users/{user_id}/coep-document"].get).toBeDefined();
  });
});
