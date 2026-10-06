import { Prisma, prisma, user_account_status } from "@niar/database";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import { auditRepository } from "./audit-repository.js";

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

export type UserAuthEvaluationTarget = {
  id: number;
  role: UserRole;
  accountStatus: user_account_status;
  researcherProfile: { userId: number } | null;
};

export type UserAuthEvaluationRecord = {
  id: number;
  userId: number;
  status: user_account_status;
  justification: string | null;
  evaluatedByUserId: number;
  evaluatedAt: Date;
  createdAt: Date;
  userCoepDataId: number | null;
};

export type CoepDocumentRecord = {
  role: UserRole;
  researcherProfile: { userId: number } | null;
  coepData: Array<{
    documentFilename: string;
    documentStoragePath: string;
  }>;
};

type RegistrationAudit = {
  actorUserId: number;
  role: UserRole;
  email: string;
};

const createRegistrationAudit = (
  tx: Prisma.TransactionClient,
  user: { id: number },
  audit: RegistrationAudit,
) => auditRepository.create({
  userId: audit.actorUserId,
  action: "create_user",
  resourceType: "user",
  resourceId: String(user.id),
  details: `Created ${audit.role} user with email ${audit.email}`,
}, tx);

// Formato de entrada do cadastro público. Nomes em camelCase pq é assim que as colunas aparecem no Prisma; a tradução do snake_case que chega na requisição acontece no service.
export type CreateResearcherData = {
  fullName: string;
  email: string;
  hashedPassword: string;
  profile: {
    phone: string;
    institution: string;
    organizationalUnit: string;
    contactAddress: string;
  };
  researcherProfile: {
    researchArea: string;
    position: string;
  };
  coep: {
    caae: string;
    opinionNumber: string;
    approvalDate: Date;
    documentFilename: string;
    documentStoragePath: string;
  };
};

export type CreatedResearcherRecord = {
  user: {
    id: number;
    email: string;
    fullName: string;
    role: UserRole;
    accountStatus: "pending" | "active" | "rejected" | "disabled";
    createdAt: Date;
  };
  profile: {
    phone: string | null;
    institution: string | null;
    organizationalUnit: string | null;
    contactAddress: string | null;
  };
  researcherProfile: {
    researchArea: string | null;
    position: string | null;
  };
  coep: {
    caae: string;
    opinionNumber: string;
    approvalDate: Date;
    documentFilename: string;
  };
};

export const usersRepository = {
  // Única camada que acessa o Prisma/banco. Service e controller não sabem que existe um Postgres por trás disso.
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

  findAuthEvaluationTarget: (id: number): Promise<UserAuthEvaluationTarget | null> =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        accountStatus: true,
        researcherProfile: { select: { userId: true } }
      }
    }),

  findCoepDocument: (id: number): Promise<CoepDocumentRecord | null> =>
    prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
        researcherProfile: { select: { userId: true } },
        coepData: {
          select: {
            documentFilename: true,
            documentStoragePath: true
          },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    }),

  createAuthEvaluation: (data: {
    userId: number;
    expectedStatus: user_account_status;
    status: user_account_status;
    justification: string | null;
    evaluatedByUserId: number;
  }): Promise<UserAuthEvaluationRecord> =>
    prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.updateMany({
        where: {
          id: data.userId,
          role: "researcher",
          accountStatus: data.expectedStatus
        },
        data: { accountStatus: data.status }
      });

      if (updated.count !== 1) {
        throw new AppError("O status do cadastro foi alterado por outra revisão", 409);
      }

      const coep = await transaction.userCoepData.findFirst({
        where: { userId: data.userId },
        select: { id: true },
        orderBy: { createdAt: "desc" }
      });
      const evaluatedAt = new Date();
      const evaluation = await transaction.userAuthEvaluation.create({
        data: {
          userId: data.userId,
          status: data.status,
          justification: data.justification,
          evaluatedByUserId: data.evaluatedByUserId,
          evaluatedAt,
          userCoepDataId: coep?.id
        }
      });

      return {
        ...evaluation,
        evaluatedByUserId: data.evaluatedByUserId,
        evaluatedAt
      };
    }),

// Cadastro público: o pesquisador só existe junto com perfil, dados acadêmicos e parecer do COEP. prisma.$transaction executa os quatro INSERTs como uma operação só — se qualquer um falhar, o banco desfaz todos e nenhum registro pela metade fica para trás.
  createResearcherWithProfile: (data: CreateResearcherData): Promise<CreatedResearcherRecord> =>
    prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          hashedPassword: data.hashedPassword,
          role: "researcher",
          accountStatus: "pending"
        }
      });

      const profile = await tx.userProfile.create({
        data: { userId: user.id, ...data.profile }
      });

      const researcherProfile = await tx.researcherProfile.create({
        data: { userId: user.id, ...data.researcherProfile }
      });

      const coep = await tx.userCoepData.create({
        data: {
          userId: user.id,
          ...data.coep
        }
      });

      return { user, profile, researcherProfile, coep };
    }),

  create: (data: { fullName: string; email: string; hashedPassword: string; role?: UserRole, accountStatus?: user_account_status }) =>
    prisma.user.create({ data }),

  // * mantive uma separação de create por garantia
  createAdministrator: (
    data: { fullName: string; email: string; hashedPassword: string, role: UserRole, accountStatus: user_account_status },
    audit: RegistrationAudit,
  ) => prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data });
    await createRegistrationAudit(tx, user, audit);
    return user;
  }),

  createCommitteeMember: (data: {
    user: { fullName: string; email: string; hashedPassword: string, role: UserRole, accountStatus: user_account_status };
    committeeMemberProfile: { specialtyId: number };
    evaluation?: { evaluatedByUserId: number, status: user_account_status; evaluatedAt?: Date };
  }, audit: RegistrationAudit) =>
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
      await createRegistrationAudit(tx, user, audit);
      return user;
    }),

    createResearcher: (data: {
      user: { fullName: string; email: string; hashedPassword: string, role: UserRole, accountStatus: user_account_status };
      profile?: { phone?: string; institution?: string; organizationalUnit?: string; contactAddress?: string };
      researcherProfile?: { researchArea?: string; position?: string };
      coep: { caae: string; opinionNumber: string; approvalDate: Date; documentFilename: string; documentStoragePath: string };
      evaluation?: { evaluatedByUserId: number, status: user_account_status; evaluatedAt?: Date };
    }, audit: RegistrationAudit) =>
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
        await createRegistrationAudit(tx, user, audit);
        return user;
      }),
};
