import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import type { CommitteeEvaluationDetails } from "../src/repositories/committee-evaluations-repository.js";

process.env.SECRET_KEY = "test-secret";

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: "pending" | "active" | "rejected" | "disabled";
};

const findUserById = jest.fn<(id: number) => Promise<StoredUser | null>>();
const createAssignment = jest.fn<(data: unknown) => Promise<CommitteeEvaluationDetails>>();
const finalize = jest.fn<(data: unknown) => Promise<CommitteeEvaluationDetails>>();
const findByProjectVersionId = jest.fn<(id: number) => Promise<CommitteeEvaluationDetails>>();

jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findById: findUserById }
}));

jest.unstable_mockModule("../src/repositories/committee-evaluations-repository.js", () => ({
  committeeEvaluationsRepository: { createAssignment, finalize, findByProjectVersionId }
}));

const { app } = await import("../src/app.js");

const tokenFor = (userId: number) =>
  jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

const buildUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({
  id: 10,
  email: "admin@niar.local",
  fullName: "Administrador",
  role: "admin",
  accountStatus: "active",
  ...overrides
});

const buildEvaluation = (overrides: Partial<CommitteeEvaluationDetails> = {}): CommitteeEvaluationDetails => ({
  id: 50,
  responsibleMemberUserId: 12,
  result: "to_review",
  justification: null,
  evaluatedAt: null,
  createdAt: new Date("2026-10-01T12:00:00.000Z"),
  updatedAt: new Date("2026-10-01T12:00:00.000Z"),
  projectVersion: {
    id: 7,
    projectId: 3,
    versionNumber: 1,
    status: "under_review",
    userCoepDataId: null,
    submittedAt: new Date("2026-09-30T12:00:00.000Z"),
    createdAt: new Date("2026-09-30T12:00:00.000Z"),
    project: { id: 3, ownerUserId: 20, title: "Projeto teste" }
  },
  responsibleMember: {
    userId: 12,
    user: { fullName: "Membro do Comitê", email: "comite@niar.local" },
    specialty: { id: 2, code: "epidemiology", name: "Epidemiologia" }
  },
  ...overrides
});

beforeEach(() => {
  findUserById.mockReset();
  createAssignment.mockReset();
  finalize.mockReset();
  findByProjectVersionId.mockReset();
});

describe("POST /api/admin/project-versions/:id/committee-evaluation", () => {
  it("exige autenticação", async () => {
    const response = await request(app).post("/api/admin/project-versions/7/committee-evaluation").send({});

    expect(response.status).toBe(401);
    expect(createAssignment).not.toHaveBeenCalled();
  });

  it("impede pesquisadores de atribuir uma avaliação", async () => {
    findUserById.mockResolvedValueOnce(buildUser({ id: 20, role: "researcher" }));

    const response = await request(app)
      .post("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(20)}`)
      .send({});

    expect(response.status).toBe(403);
    expect(createAssignment).not.toHaveBeenCalled();
  });

  it("exige que o admin informe o membro responsável", async () => {
    findUserById.mockResolvedValueOnce(buildUser());

    const response = await request(app)
      .post("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({});

    expect(response.status).toBe(400);
    expect(createAssignment).not.toHaveBeenCalled();
  });

  it("admin atribui a versão ao membro informado", async () => {
    findUserById.mockResolvedValueOnce(buildUser());
    createAssignment.mockResolvedValueOnce(buildEvaluation());

    const response = await request(app)
      .post("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ responsible_member_user_id: 12 });

    expect(response.status).toBe(201);
    expect(createAssignment).toHaveBeenCalledWith(
      expect.objectContaining({
        projectVersionId: 7,
        responsibleMemberUserId: 12,
        actorUserId: 10
      })
    );
    expect(response.body).toMatchObject({
      result: "to_review",
      justification: null,
      project_version: { id: 7, status: "under_review" },
      responsible_member: {
        user_id: 12,
        specialty: { code: "epidemiology" }
      }
    });
  });

  it("membro do comitê assume a própria avaliação", async () => {
    findUserById.mockResolvedValueOnce(buildUser({ id: 12, role: "committee" }));
    createAssignment.mockResolvedValueOnce(buildEvaluation());

    const response = await request(app)
      .post("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(12)}`)
      .send({});

    expect(response.status).toBe(201);
    expect(createAssignment).toHaveBeenCalledWith(
      expect.objectContaining({ responsibleMemberUserId: 12, actorUserId: 12 })
    );
  });
});

describe("PUT /api/admin/project-versions/:id/committee-evaluation", () => {
  it.each(["needs_changes", "rejected"])("exige justificativa para %s", async (result) => {
    findUserById.mockResolvedValueOnce(buildUser());

    const response = await request(app)
      .put("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ result, justification: "   " });

    expect(response.status).toBe(400);
    expect(finalize).not.toHaveBeenCalled();
  });

  it("grava o parecer padrão quando approved não traz justificativa", async () => {
    findUserById.mockResolvedValueOnce(buildUser());
    finalize.mockResolvedValueOnce(
      buildEvaluation({
        result: "approved",
        justification: "Aprovado pelo comitê.",
        evaluatedAt: new Date("2026-10-02T12:00:00.000Z"),
        projectVersion: {
          ...buildEvaluation().projectVersion,
          status: "approved"
        }
      })
    );

    const response = await request(app)
      .put("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ result: "approved" });

    expect(response.status).toBe(200);
    expect(finalize).toHaveBeenCalledWith(
      expect.objectContaining({
        result: "approved",
        justification: "Aprovado pelo comitê.",
        actorUserId: 10
      })
    );
    expect(response.body.justification).toBe("Aprovado pelo comitê.");
  });

  it("rejeita to_review como resultado final", async () => {
    findUserById.mockResolvedValueOnce(buildUser());

    const response = await request(app)
      .put("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ result: "to_review" });

    expect(response.status).toBe(400);
    expect(finalize).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/project-versions/:id/committee-evaluation", () => {
  it("retorna os dados relacionados sem campos sensíveis", async () => {
    findUserById.mockResolvedValueOnce(buildUser());
    findByProjectVersionId.mockResolvedValueOnce(buildEvaluation());

    const response = await request(app)
      .get("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(response.body.project.title).toBe("Projeto teste");
    expect(response.body.responsible_member.specialty.name).toBe("Epidemiologia");
    expect(response.body.responsible_member).not.toHaveProperty("hashed_password");
  });

  it("membro do comitê não consulta avaliação atribuída a outra pessoa", async () => {
    findUserById.mockResolvedValueOnce(buildUser({ id: 13, role: "committee" }));
    findByProjectVersionId.mockResolvedValueOnce(buildEvaluation());

    const response = await request(app)
      .get("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(13)}`);

    expect(response.status).toBe(403);
  });
});
