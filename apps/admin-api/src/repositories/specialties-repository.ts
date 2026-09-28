import { prisma } from "@niar/database";

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

export const specialtiesRepository = {
  findAll: (filter: SpecialtyListFilter): Promise<SpecialtyRecord[]> =>
    prisma.specialty.findMany({
      where: {
        isActive: filter.isActive,
        // "mode: insensitive" é o que faz o Postgres ignorar maiúscula/
        // minúscula na busca (sem isso, "epidemio" não encontraria
        // "Epidemiologia", porque o LIKE do Postgres é case-sensitive).
        OR: filter.query
          ? [{ name: { contains: filter.query, mode: "insensitive" } }, { code: { contains: filter.query, mode: "insensitive" } }]
          : undefined
      },
      orderBy: { id: "asc" },
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize
    }),

  findById: (id: number) => prisma.specialty.findUnique({ where: { id } }),

  findByCode: (code: string) => prisma.specialty.findUnique({ where: { code } }),

  findByNameNormalized: (nameNormalized: string) => prisma.specialty.findUnique({ where: { nameNormalized } }),

  create: (data: CreateSpecialtyData) => prisma.specialty.create({ data }),

  // "updated_at" não é gerenciado pelo Prisma automaticamente (não usa
  // @updatedAt no schema), por isso precisa ser setado aqui a cada edição.
  update: (id: number, data: UpdateSpecialtyData) =>
    prisma.specialty.update({ where: { id }, data: { ...data, updatedAt: new Date() } })
};
