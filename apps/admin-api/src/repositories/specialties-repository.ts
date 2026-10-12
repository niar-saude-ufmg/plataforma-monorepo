import { Prisma, prisma } from "@niar/database";
import { AppError } from "../errors/app-error.js";

export type SpecialtyRecord = {
  id: number;
  code: string;
  name: string;
  nameNormalized: string;
  description: string;
  guidanceContext: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SpecialtyListFilter = {
  query?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
};

export type SpecialtyListResult = {
  items: SpecialtyRecord[];
  total: number;
};

export type CreateSpecialtyData = {
  code: string;
  name: string;
  nameNormalized: string;
  description: string;
  guidanceContext: string;
};

export type UpdateSpecialtyData = {
  name?: string;
  nameNormalized?: string;
  description?: string;
  guidanceContext?: string;
  isActive?: boolean;
};

const buildWhere = (filter: Pick<SpecialtyListFilter, "query" | "isActive">): Prisma.SpecialtyWhereInput => ({
  isActive: filter.isActive,
  OR: filter.query
    ? [{ name: { contains: filter.query, mode: "insensitive" } }, { code: { contains: filter.query, mode: "insensitive" } }]
    : undefined
});

const rethrowSpecialtyWriteError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = String(error.meta?.target ?? "").toLowerCase();
    const field = target.includes("code") ? "código" : "nome";

    throw new AppError(`Já existe uma especialidade com este ${field}`, 409);
  }

  throw error;
};

export const specialtiesRepository = {
  findAll: async (filter: SpecialtyListFilter): Promise<SpecialtyListResult> => {
    const where = buildWhere(filter);
    const [items, total] = await prisma.$transaction([
      prisma.specialty.findMany({
        where,
        orderBy: { id: "asc" },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize
      }),
      prisma.specialty.count({ where })
    ]);

    return { items, total };
  },

  findById: (id: number) => prisma.specialty.findUnique({ where: { id } }),

  findByCode: (code: string) => prisma.specialty.findUnique({ where: { code } }),

  findByNameNormalized: (nameNormalized: string) => prisma.specialty.findUnique({ where: { nameNormalized } }),

  create: async (data: CreateSpecialtyData) => {
    try {
      return await prisma.specialty.create({ data });
    } catch (error) {
      return rethrowSpecialtyWriteError(error);
    }
  },

  // "updated_at" não é gerenciado pelo Prisma automaticamente (não usa
  // @updatedAt no schema), por isso precisa ser setado aqui a cada edição.
  update: async (id: number, data: UpdateSpecialtyData) => {
    try {
      return await prisma.specialty.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
    } catch (error) {
      return rethrowSpecialtyWriteError(error);
    }
  }
};
