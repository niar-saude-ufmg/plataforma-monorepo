import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import type { EvaluationDetails } from "../src/repositories/evaluations-repository.js";

process.env.SECRET_KEY = "test-secret";

type StoredUser = { id: number; email: string; fullName: string; role: UserRole; accountStatus: "active" };
const findUserById = jest.fn<(id: number) => Promise<StoredUser | null>>();
const assign = jest.fn<(data: unknown) => Promise<EvaluationDetails>>();
const findByProjectVersionId = jest.fn<(id: number) => Promise<EvaluationDetails>>();
const decide = jest.fn<(data: unknown) => Promise<EvaluationDetails>>();

jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({ usersRepository: { findById: findUserById } }));
jest.unstable_mockModule("../src/repositories/evaluations-repository.js", () => ({ evaluationsRepository: { assign, findByProjectVersionId, decide } }));

const { app } = await import("../src/app.js");
const tokenFor = (userId: number) => jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });
const buildUser = (overrides: Partial<StoredUser> = {}): StoredUser => ({ id: 10, email: "admin@niar.local", fullName: "Administrador", role: "admin", accountStatus: "active", ...overrides });

const buildEvaluation = (): EvaluationDetails => ({
  id: 50,
  projectVersionId: 7,
  assignedToUserId: 12,
  assignedByUserId: 10,
  evaluatedByUserId: 12,
  status: "project_approved",
  justification: null,
  certificationDecision: null,
  certificationReason: null,
  evaluatedAt: new Date("2026-10-01T12:00:00.000Z"),
  createdAt: new Date("2026-10-01T12:00:00.000Z"),
  updatedAt: new Date("2026-10-01T12:00:00.000Z"),
  assignedTo: { id: 12, fullName: "Membro do comitê", email: "comite@niar.local", role: "committee" },
  assignedBy: { id: 10, fullName: "Administrador", email: "admin@niar.local", role: "admin" },
  evaluatedBy: { id: 12, fullName: "Membro do comitê", email: "comite@niar.local", role: "committee" },
  projectVersion: {
    id: 7, projectId: 3, versionNumber: 1, status: "approved_to_schedule",
    submittedAt: new Date("2026-09-30T12:00:00.000Z"), createdAt: new Date("2026-09-30T12:00:00.000Z"),
    project: { id: 3, ownerUserId: 20, title: "Projeto teste" }
  }
});

beforeEach(() => { findUserById.mockReset(); assign.mockReset(); findByProjectVersionId.mockReset(); decide.mockReset(); });

describe("/api/admin/project-versions/:id/evaluation", () => {
  it("permite ao admin atribuir e ao membro responsável registrar o parecer", async () => {
    const evaluation = buildEvaluation();
    findUserById.mockResolvedValueOnce(buildUser());
    assign.mockResolvedValue(evaluation);

    const assigned = await request(app).post("/api/admin/project-versions/7/evaluation").set("Authorization", `Bearer ${tokenFor(10)}`).send({ assigned_to_user_id: 12 });
    expect(assigned.status).toBe(201);
    expect(assign).toHaveBeenCalledWith(expect.objectContaining({ projectVersionId: 7, assignedToUserId: 12, actorUserId: 10, actorRole: "admin" }));

    findUserById.mockResolvedValueOnce(buildUser({ id: 12, role: "committee" }));
    decide.mockResolvedValue(evaluation);
    const updated = await request(app).put("/api/admin/project-versions/7/evaluation").set("Authorization", `Bearer ${tokenFor(12)}`).send({ status: "project_approved" });
    expect(updated.status).toBe(200);
    expect(decide).toHaveBeenCalledWith(expect.objectContaining({ projectVersionId: 7, actorUserId: 12, status: "project_approved" }));
  });

  it("rejeita to_review como decisão do comitê", async () => {
    findUserById.mockResolvedValue(buildUser({ id: 12, role: "committee" }));

    const response = await request(app)
      .put("/api/admin/project-versions/7/evaluation")
      .set("Authorization", `Bearer ${tokenFor(12)}`)
      .send({ status: "to_review" });

    expect(response.status).toBe(400);
    expect(decide).not.toHaveBeenCalled();
  });

  it("aceita a decisão sobre o selo somente na aprovação do relatório", async () => {
    findUserById.mockResolvedValue(buildUser({ id: 12, role: "committee" }));
    const invalid = await request(app).put("/api/admin/project-versions/7/evaluation").set("Authorization", `Bearer ${tokenFor(12)}`).send({ status: "project_approved", certification_decision: "granted" });
    expect(invalid.status).toBe(400);

    decide.mockResolvedValue({ ...buildEvaluation(), status: "report_approved", certificationDecision: "granted" });
    const valid = await request(app).put("/api/admin/project-versions/7/evaluation").set("Authorization", `Bearer ${tokenFor(12)}`).send({ status: "report_approved", certification_decision: "granted" });
    expect(valid.status).toBe(200);
  });
});
