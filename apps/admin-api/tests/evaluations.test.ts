import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import type { EvaluationDetails } from "../src/repositories/evaluations-repository.js";

process.env.SECRET_KEY = "test-secret";

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: "active";
};

const findUserById = jest.fn<(id: number) => Promise<StoredUser | null>>();
const createAssignment = jest.fn<(data: unknown) => Promise<EvaluationDetails>>();
const findByProjectVersionId = jest.fn<(id: number) => Promise<EvaluationDetails>>();
const update = jest.fn<(data: unknown) => Promise<EvaluationDetails>>();

jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findById: findUserById }
}));

jest.unstable_mockModule("../src/repositories/evaluations-repository.js", () => ({
  evaluationsRepository: { createAssignment, findByProjectVersionId, update }
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

const buildEvaluation = (): EvaluationDetails => ({
  id: 50,
  projectVersionId: 7,
  assignedToUserId: 12,
  assignedByUserId: 10,
  evaluatedByUserId: null,
  context: "pre_safe_room",
  status: "to_review",
  justification: null,
  evaluatedAt: null,
  createdAt: new Date("2026-10-01T12:00:00.000Z"),
  updatedAt: new Date("2026-10-01T12:00:00.000Z"),
  assignedTo: { id: 12, fullName: "Auditor", email: "auditor@niar.local", role: "auditor" },
  assignedBy: { id: 10, fullName: "Administrador", email: "admin@niar.local", role: "admin" },
  evaluatedBy: null,
  projectVersion: {
    id: 7,
    projectId: 3,
    versionNumber: 1,
    status: "under_review",
    submittedAt: new Date("2026-09-30T12:00:00.000Z"),
    createdAt: new Date("2026-09-30T12:00:00.000Z"),
    project: { id: 3, ownerUserId: 20, title: "Projeto teste" }
  }
});

beforeEach(() => {
  findUserById.mockReset();
  createAssignment.mockReset();
  findByProjectVersionId.mockReset();
  update.mockReset();
});

describe("/api/admin/project-versions/:id/evaluation", () => {
  it("usa o mesmo endpoint para atribuição, consulta e atualização", async () => {
    const evaluation = buildEvaluation();
    findUserById.mockResolvedValue(buildUser());
    createAssignment.mockResolvedValue(evaluation);
    findByProjectVersionId.mockResolvedValue(evaluation);
    update.mockResolvedValue(evaluation);

    const assigned = await request(app)
      .post("/api/admin/project-versions/7/evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`)
      .send({ assigned_to_user_id: 12 });

    expect(assigned.status).toBe(201);
    expect(createAssignment).toHaveBeenCalledWith(expect.objectContaining({
      projectVersionId: 7,
      assignedToUserId: 12,
      actorUserId: 10,
      actorRole: "admin"
    }));

    const consulted = await request(app)
      .get("/api/admin/project-versions/7/evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(consulted.status).toBe(200);
    expect(consulted.body.status).toBe("to_review");
    expect(consulted.body.assigned_to.user_id).toBe(12);

    findUserById.mockResolvedValue(buildUser({ id: 12, role: "auditor" }));
    const updated = await request(app)
      .put("/api/admin/project-versions/7/evaluation")
      .set("Authorization", `Bearer ${tokenFor(12)}`)
      .send({ status: "sent_to_committee", committee_member_user_id: 31, justification: "Enviar para análise." });

    expect(updated.status).toBe(200);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      projectVersionId: 7,
      actorUserId: 12,
      actorRole: "auditor",
      status: "sent_to_committee",
      committeeMemberUserId: 31
    }));
  });

  it("não mantém as rotas legadas por papel", async () => {
    findUserById.mockResolvedValue(buildUser());

    const response = await request(app)
      .get("/api/admin/project-versions/7/committee-evaluation")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(404);
  });
});
