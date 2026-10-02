import { prisma, user_account_status } from "@niar/database";
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
  accountStatus: user_account_status;
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


  create: (data: { fullName: string; email: string; hashedPassword: string; role?: UserRole, accountStatus?: user_account_status }) =>
    prisma.user.create({ data }),

  // * mantive uma separação de create por garantia
  createAdministrator: (data: { fullName: string; email: string; hashedPassword: string, role: UserRole, accountStatus: user_account_status }) =>
    prisma.user.create({ data }),

  createCommitteeMember: (data: {
    user: { fullName: string; email: string; hashedPassword: string, role: UserRole, accountStatus: user_account_status };
    committeeMemberProfile: { specialtyId: number };
    evaluation?: { evaluatedByUserId: number, status: user_account_status; evaluatedAt?: Date };
  }) =>
    prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: data.user
      });
      if (data.evaluation) {
        await tx.userAuthEvaluation.create({
          data: {
            userId: user.id,
            status: data.evaluation.status,
            evaluatedByUserId: data.evaluation.evaluatedByUserId,
            evaluatedAt: data.evaluation.evaluatedAt || new Date(),
          },
        });
      }
      await tx.committeeMemberProfile.create({
        data: {
          userId: user.id,
          specialtyId: data.committeeMemberProfile.specialtyId,
        },
      });
      return user;
    }),

    createResearcher: (data: {
      user: { fullName: string; email: string; hashedPassword: string, role: UserRole, accountStatus: user_account_status };
      profile?: { phone?: string; institution?: string; organizationalUnit?: string; contactAddress?: string };
      researcherProfile?: { researchArea?: string; position?: string };
      coep: { caae: string; opinionNumber: string; approvalDate: Date; documentFilename: string; documentStoragePath: string };
      evaluation?: { evaluatedByUserId: number, status: user_account_status; evaluatedAt?: Date };
    }) =>
      prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: data.user
        });
        if (data.profile) {
          await tx.userProfile.create({
            data: { userId: user.id, ...data.profile },
          });
        }
        if (data.researcherProfile) {
          await tx.researcherProfile.create({
            data: { userId: user.id, ...data.researcherProfile },
          });
        }
        const coep = await tx.userCoepData.create({
          data: { userId: user.id, ...data.coep },
        });
        if (data.evaluation) {
          await tx.userAuthEvaluation.create({
            data: {
              userId: user.id,
              status: data.evaluation.status,
              evaluatedByUserId: data.evaluation.evaluatedByUserId,
              evaluatedAt: data.evaluation.evaluatedAt || new Date(),
              userCoepDataId: coep.id,
            },
          });
        }
        return user;
      }),
};
