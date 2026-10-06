import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const updateUser = jest.fn<(args: unknown) => Promise<{ count: number }>>();
const createUser = jest.fn<(args: unknown) => Promise<Record<string, unknown>>>();
const createProfile = jest.fn<(args: unknown) => Promise<Record<string, unknown>>>();
const createResearcherProfile = jest.fn<(args: unknown) => Promise<Record<string, unknown>>>();
const findCoep = jest.fn<(args: unknown) => Promise<{ id: number } | null>>();
const createCoep = jest.fn<(args: unknown) => Promise<Record<string, unknown>>>();
const createEvaluation = jest.fn<(args: unknown) => Promise<Record<string, unknown>>>();

const transaction = {
  user: { updateMany: updateUser, create: createUser },
  userProfile: { create: createProfile },
  researcherProfile: { create: createResearcherProfile },
  userCoepData: { findFirst: findCoep, create: createCoep },
  userAuthEvaluation: { create: createEvaluation }
};

const runTransaction = jest.fn<
  (callback: (client: typeof transaction) => Promise<unknown>) => Promise<unknown>
>();

jest.unstable_mockModule("@niar/database", () => ({
  prisma: {
    $transaction: runTransaction,
    user: { findUnique: jest.fn() }
  },
  Prisma: {}
}));

jest.unstable_mockModule("../src/repositories/audit-repository.js", () => ({
  auditRepository: { create: jest.fn() }
}));

const { usersRepository } = await import("../src/repositories/users-repository.js");

beforeEach(() => {
  jest.clearAllMocks();
  runTransaction.mockImplementation(async (callback) => callback(transaction));
});

describe("usersRepository.createResearcherWithProfile", () => {
  it("cria o cadastro público com status pending", async () => {
    createUser.mockResolvedValue({ id: 40 });
    createProfile.mockResolvedValue({ userId: 40 });
    createResearcherProfile.mockResolvedValue({ userId: 40 });
    createCoep.mockResolvedValue({ id: 4 });

    await usersRepository.createResearcherWithProfile({
      fullName: "Pesquisador",
      email: "pesquisador@niar.local",
      hashedPassword: "hash",
      profile: {
        phone: "31999999999",
        institution: "UFMG",
        organizationalUnit: "Medicina",
        contactAddress: "Belo Horizonte"
      },
      researcherProfile: {
        researchArea: "Saúde pública",
        position: "Professor"
      },
      coep: {
        caae: "12345678.9.0000.0000",
        opinionNumber: "1234.567",
        approvalDate: new Date("2026-09-25T00:00:00.000Z"),
        documentFilename: "parecer.pdf",
        documentStoragePath: "/exports/coep/parecer.pdf"
      }
    });

    expect(createUser).toHaveBeenCalledWith({
      data: {
        fullName: "Pesquisador",
        email: "pesquisador@niar.local",
        hashedPassword: "hash",
        role: "researcher",
        accountStatus: "pending"
      }
    });
  });
});

describe("usersRepository.createAuthEvaluation", () => {
  it("atualiza a conta e cria uma nova avaliação na mesma transação", async () => {
    updateUser.mockResolvedValue({ count: 1 });
    findCoep.mockResolvedValue({ id: 4 });
    createEvaluation.mockResolvedValue({
      id: 12,
      userId: 40,
      status: "active",
      justification: "Cadastro aprovado.",
      evaluatedByUserId: 10,
      evaluatedAt: new Date(),
      createdAt: new Date(),
      userCoepDataId: 4
    });

    await usersRepository.createAuthEvaluation({
      userId: 40,
      expectedStatus: "pending",
      status: "active",
      justification: "Cadastro aprovado.",
      evaluatedByUserId: 10
    });

    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenCalledWith({
      where: { id: 40, role: "researcher", accountStatus: "pending" },
      data: { accountStatus: "active" }
    });
    expect(createEvaluation).toHaveBeenCalledWith({
      data: {
        userId: 40,
        status: "active",
        justification: "Cadastro aprovado.",
        evaluatedByUserId: 10,
        evaluatedAt: expect.any(Date),
        userCoepDataId: 4
      }
    });
  });

  it("não cria histórico quando o status mudou durante a revisão", async () => {
    updateUser.mockResolvedValue({ count: 0 });

    await expect(usersRepository.createAuthEvaluation({
      userId: 40,
      expectedStatus: "pending",
      status: "rejected",
      justification: "Parecer inválido",
      evaluatedByUserId: 10
    })).rejects.toMatchObject({ statusCode: 409 });

    expect(findCoep).not.toHaveBeenCalled();
    expect(createEvaluation).not.toHaveBeenCalled();
  });

  it("propaga falha na criação da avaliação para desfazer a transação", async () => {
    updateUser.mockResolvedValue({ count: 1 });
    findCoep.mockResolvedValue(null);
    createEvaluation.mockRejectedValue(new Error("evaluation failure"));

    await expect(usersRepository.createAuthEvaluation({
      userId: 40,
      expectedStatus: "pending",
      status: "active",
      justification: null,
      evaluatedByUserId: 10
    })).rejects.toThrow("evaluation failure");

    expect(runTransaction).toHaveBeenCalledTimes(1);
  });
});
