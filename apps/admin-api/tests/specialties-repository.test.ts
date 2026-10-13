import { jest } from "@jest/globals";

const create = jest.fn<(args: unknown) => Promise<unknown>>();
const update = jest.fn<(args: unknown) => Promise<unknown>>();
const findMany = jest.fn<(args: unknown) => Promise<unknown[]>>();
const count = jest.fn<(args: unknown) => Promise<number>>();
const transaction = jest.fn(async (operations: readonly Promise<unknown>[]) => Promise.all(operations));

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
    specialty: { create, update, findMany, count },
    $transaction: transaction
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
  it("aplica os mesmos filtros na lista e na contagem e pagina os resultados", async () => {
    const items = [{ id: 3, code: "epi", name: "Epidemiologia" }];
    findMany.mockResolvedValueOnce(items);
    count.mockResolvedValueOnce(21);

    const result = await specialtiesRepository.findAll({
      query: "epi",
      isActive: false,
      page: 3,
      pageSize: 5
    });

    const where = {
      isActive: false,
      OR: [
        { name: { contains: "epi", mode: "insensitive" } },
        { code: { contains: "epi", mode: "insensitive" } }
      ]
    };

    expect(findMany).toHaveBeenCalledWith({
      where,
      orderBy: { id: "asc" },
      skip: 10,
      take: 5
    });
    expect(count).toHaveBeenCalledWith({ where });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ items, total: 21 });
  });

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
