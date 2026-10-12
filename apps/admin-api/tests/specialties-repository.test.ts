import { jest } from "@jest/globals";

const create = jest.fn<(args: unknown) => Promise<unknown>>();
const update = jest.fn<(args: unknown) => Promise<unknown>>();

class PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: { target?: string[] };

  constructor(code: string, target?: string[]) {
    super(code);
    this.code = code;
    this.meta = { target };
  }
}

jest.unstable_mockModule("@niar/database", () => ({
  prisma: {
    specialty: { create, update }
  },
  Prisma: { PrismaClientKnownRequestError }
}));

const { specialtiesRepository } = await import("../src/repositories/specialties-repository.js");

const createData = {
  code: "epidemiology",
  name: "Epidemiologia",
  nameNormalized: "epidemiologia",
  description: "",
  guidanceContext: ""
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("specialtiesRepository", () => {
  it("converte conflito de código do Prisma em erro 409", async () => {
    create.mockRejectedValueOnce(new PrismaClientKnownRequestError("P2002", ["code"]));

    await expect(specialtiesRepository.create(createData)).rejects.toMatchObject({
      statusCode: 409,
      message: "Já existe uma especialidade com este código"
    });
  });

  it("converte conflito de nome do Prisma em erro 409", async () => {
    update.mockRejectedValueOnce(new PrismaClientKnownRequestError("P2002", ["name_normalized"]));

    await expect(specialtiesRepository.update(1, { name: "Epidemiologia" })).rejects.toMatchObject({
      statusCode: 409,
      message: "Já existe uma especialidade com este nome"
    });
  });

  it("preserva erros que não sejam conflitos de unicidade", async () => {
    const databaseError = new Error("database unavailable");
    create.mockRejectedValueOnce(databaseError);

    await expect(specialtiesRepository.create(createData)).rejects.toBe(databaseError);
  });
});
