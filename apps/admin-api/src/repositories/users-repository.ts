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

  create: (data: { fullName: string; email: string; hashedPassword: string; role?: UserRole }) =>
    prisma.user.create({ data }),

// Cadastro público: o pesquisador só existe junto com perfil, dados acadêmicos e parecer do COEP. prisma.$transaction executa os quatro INSERTs como uma operação só — se qualquer um falhar, o banco desfaz todos e nenhum registro pela metade fica para trás.
  createResearcherWithProfile: (data: CreateResearcherData): Promise<CreatedResearcherRecord> =>
    prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          hashedPassword: data.hashedPassword,
          role: "researcher",
          accountStatus: "active"
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
    })
};
