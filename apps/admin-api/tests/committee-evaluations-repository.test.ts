import { jest } from "@jest/globals";

const findVersion = jest.fn<(args: unknown) => Promise<unknown>>();
const updateVersion = jest.fn<(args: unknown) => Promise<unknown>>();
const findUser = jest.fn<(args: unknown) => Promise<unknown>>();
const createEvaluation = jest.fn<(args: unknown) => Promise<unknown>>();
const updateEvaluation = jest.fn<(args: unknown) => Promise<{ count: number }>>();
const loadEvaluation = jest.fn<(args: unknown) => Promise<unknown>>();
const createHistory = jest.fn<(args: unknown) => Promise<unknown>>();
const createAudit = jest.fn<(args: unknown) => Promise<unknown>>();

const transaction = {
  projectVersion: { findUnique: findVersion, update: updateVersion },
  user: { findUnique: findUser },
  committeeEvaluation: {
    create: createEvaluation,
    updateMany: updateEvaluation,
    findUniqueOrThrow: loadEvaluation
  },
  projectStatusHistory: { create: createHistory },
  auditLog: { create: createAudit }
};

const runTransaction = jest.fn<
  (callback: (client: typeof transaction) => Promise<unknown>) => Promise<unknown>
>();

class PrismaClientKnownRequestError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

jest.unstable_mockModule("@niar/database", () => ({
  prisma: {
    $transaction: runTransaction,
    projectVersion: { findUnique: jest.fn() }
  },
  Prisma: { PrismaClientKnownRequestError }
}));

const { committeeEvaluationsRepository } = await import(
  "../src/repositories/committee-evaluations-repository.js"
);

const evaluationDetails = {
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
    user: { fullName: "Membro", email: "membro@niar.local" },
    specialty: { id: 2, code: "epidemiology", name: "Epidemiologia" }
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  runTransaction.mockImplementation(async (callback) => callback(transaction));
  updateVersion.mockResolvedValue({});
  createHistory.mockResolvedValue({});
  createAudit.mockResolvedValue({});
  loadEvaluation.mockResolvedValue(evaluationDetails);
});

describe("committeeEvaluationsRepository.createAssignment", () => {
  it("grava atribuição, status, histórico e auditoria na mesma transação", async () => {
    findVersion.mockResolvedValue({ committeeEvaluation: null });
    findUser.mockResolvedValue({
      role: "committee",
      committeeProfile: { specialty: { id: 2 } }
    });
    createEvaluation.mockResolvedValue({ id: 50 });

    await committeeEvaluationsRepository.createAssignment({
      projectVersionId: 7,
      responsibleMemberUserId: 12,
      actorUserId: 10,
      ipAddress: "127.0.0.1"
    });

    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(createEvaluation).toHaveBeenCalledWith({
      data: {
        projectVersionId: 7,
        responsibleMemberUserId: 12,
        result: "to_review",
        justification: null,
        evaluatedAt: null
      },
      select: { id: true }
    });
    expect(updateVersion).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: "under_review" }
    });
    expect(createHistory).toHaveBeenCalledWith({
      data: {
        projectVersionId: 7,
        status: "under_review",
        actorUserId: 10,
        committeeEvaluationId: 50,
        notes: null
      }
    });
    expect(createAudit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 10,
        action: "assign_committee_evaluation",
        resourceType: "committee_evaluation",
        resourceId: "50"
      })
    });
  });

  it("interrompe a transação quando o histórico falha", async () => {
    findVersion.mockResolvedValue({ committeeEvaluation: null });
    findUser.mockResolvedValue({
      role: "committee",
      committeeProfile: { specialty: { id: 2 } }
    });
    createEvaluation.mockResolvedValue({ id: 50 });
    createHistory.mockRejectedValue(new Error("history failure"));

    await expect(
      committeeEvaluationsRepository.createAssignment({
        projectVersionId: 7,
        responsibleMemberUserId: 12,
        actorUserId: 10,
        ipAddress: "127.0.0.1"
      })
    ).rejects.toThrow("history failure");

    expect(createAudit).not.toHaveBeenCalled();
    expect(loadEvaluation).not.toHaveBeenCalled();
  });
});

describe("committeeEvaluationsRepository.finalize", () => {
  it("atualiza avaliação, status, histórico e auditoria na mesma transação", async () => {
    findVersion.mockResolvedValue({
      committeeEvaluation: {
        id: 50,
        result: "to_review",
        responsibleMemberUserId: 12
      }
    });
    updateEvaluation.mockResolvedValue({ count: 1 });
    loadEvaluation.mockResolvedValue({
      ...evaluationDetails,
      result: "approved",
      justification: "Aprovado pelo comitê."
    });

    await committeeEvaluationsRepository.finalize({
      projectVersionId: 7,
      actorUserId: 10,
      actorRole: "admin",
      ipAddress: "127.0.0.1",
      result: "approved",
      justification: "Aprovado pelo comitê."
    });

    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(updateEvaluation).toHaveBeenCalledWith({
      where: { id: 50, result: "to_review" },
      data: {
        result: "approved",
        justification: "Aprovado pelo comitê.",
        evaluatedAt: expect.any(Date),
        updatedAt: expect.any(Date)
      }
    });
    expect(updateVersion).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: "approved" }
    });
    expect(createHistory).toHaveBeenCalledWith({
      data: {
        projectVersionId: 7,
        status: "approved",
        notes: "Aprovado pelo comitê.",
        actorUserId: 10,
        committeeEvaluationId: 50
      }
    });
    expect(createAudit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 10,
        action: "finalize_committee_evaluation",
        resourceType: "committee_evaluation",
        resourceId: "50"
      })
    });
  });

  it("não cria histórico quando outra requisição já finalizou a avaliação", async () => {
    findVersion.mockResolvedValue({
      committeeEvaluation: {
        id: 50,
        result: "to_review",
        responsibleMemberUserId: 12
      }
    });
    updateEvaluation.mockResolvedValue({ count: 0 });

    await expect(
      committeeEvaluationsRepository.finalize({
        projectVersionId: 7,
        actorUserId: 12,
        actorRole: "committee",
        ipAddress: "127.0.0.1",
        result: "rejected",
        justification: "Parecer"
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(updateVersion).not.toHaveBeenCalled();
    expect(createHistory).not.toHaveBeenCalled();
    expect(createAudit).not.toHaveBeenCalled();
  });
});
