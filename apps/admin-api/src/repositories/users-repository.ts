import { prisma } from "@niar/database";
import type { UserRole } from "@niar/contracts";
// hashedPassword fica de fora de propósito: como o select já não busca o
// campo, ele nunca existe em memória nas camadas acima (service/controller),
// então não tem como vazar por esquecimento na resposta da API.
const userListSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  accountStatus: true,
  createdAt: true
};

export type UserListRecord = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole; // O papel vem do UserRole de @niar/contracts, nao de uma lista escrita a mao acho que fica mais fácil
  accountStatus: "pending" | "active" | "rejected" | "disabled";
  createdAt: Date;
};

export type UserListFilter = {
  role?: UserRole;
  page: number;
  pageSize: number;
};

export const usersRepository = {
  // Única camada que acessa o Prisma/banco. Service e controller não sabem
  // que existe um Postgres por trás disso.
  findAll: (filter: UserListFilter): Promise<UserListRecord[]> =>
    prisma.user.findMany({
      select: userListSelect,
      where: filter.role ? { role: filter.role } : undefined,
      orderBy: { id: "asc" },
      skip: (filter.page - 1) * filter.pageSize,
      take: filter.pageSize
    }),

  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  // O middleware de auth usa isso: token só tem o id, precisa buscar a role.
  findById: (id: number) => prisma.user.findUnique({ where: { id } }),

  create: async (data: {
    fullName: string;
    email: string;
    hashedPassword: string;
    role?: UserRole;
    accountStatus: "pending" | "active";
  }) =>
    prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({ data });
      await transaction.userAuthEvaluation.create({
        data: {
          userId: user.id,
          status: data.accountStatus
        }
      });
      return user;
    })
};
