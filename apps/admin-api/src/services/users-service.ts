import { hash } from "bcryptjs";
import { basename } from "node:path";
import type { UserRole } from "@niar/contracts";
import type { user_account_status } from "@niar/database";
import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import { usersRepository } from "../repositories/users-repository.js";
import {
  removeStoredCoepDocument,
  resolveStoredCoepDocument,
  storeCoepDocument,
  type UploadedCoepDocument
} from "./coep-document-storage.js";

import { specialtiesRepository } from "../repositories/specialties-repository.js";
import {
  CreateAdministratorInput,
  CreateCommitteeMemberInput,
  CreatePublicUserInput,
  CreateResearcherInput,
  PublicUserCreatedResponse,
  ListUsersQuery,
  CreateUserAuthEvaluationInput,
  UserAuthEvaluationResponse,
  UserResponse,
} from "../schemas/user-schema.js";

const AUTH_REVIEW_TRANSITIONS: Record<user_account_status, readonly user_account_status[]> = {
  pending: ["active", "rejected"],
  active: [],
  rejected: [],
  disabled: []
};

// Usado pelo cadastro administrativo (rota protegida), que grava só o usuário.
// O cadastro público tem caminho próprio, porque também grava perfil e COEP.

type BasicUserInput = { full_name: string; email: string; password: string };

const saveUser = async (data: BasicUserInput, role: UserRole): Promise<UserResponse> => {
  const existing = await usersRepository.findByEmail(data.email);

  if (existing) {
    throw new AppError("User with this email already exists", 409);
  }

  // Hash em 10 rounds, padrão do bcrypt do Python, compatível com o assistente
  const hashedPassword = await hash(data.password, 10);

  const user = await usersRepository.create({
    fullName: data.full_name,
    email: data.email,
    hashedPassword,
    role
  });

  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
    created_at: user.createdAt.toISOString()
  };
};

const prepareUserData = async (email: string, password: string) => {
  const existing = await usersRepository.findByEmail(email);
  if (existing) {
    throw new AppError("User with this email already exists", 409);
  }
  // Hash em 10 rounds, padrão do bcrypt do Python, compatível com o assistente
  const hashedPassword = await hash(password, 10);
  return { hashedPassword };
};

const toUserResponse = (user: {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: "pending" | "active" | "rejected" | "disabled";
  createdAt: Date;
}): UserResponse => ({
  id: user.id,
  email: user.email,
  full_name: user.fullName,
  role: user.role,
  created_at: user.createdAt.toISOString(),
});

export const usersService = {
  listUsers: async (query: ListUsersQuery, currentUser: AuthenticatedUser): Promise<UserResponse[]> => {
    let role = query.role;

    // Committee só vê researcher, mesmo sem filtro. Se solicitar outro papel
    // explicitamente, a requisição é negada em vez de filtrada
    // silenciosamente, deixando claro que o pedido está fora do escopo.
    if (currentUser.role === "committee") {
      if (role && role !== "researcher") {
        throw new AppError("Comitê só pode listar pesquisadores", 403);
      }
      role = "researcher";
    }

    const users = await usersRepository.findAll({ role, page: query.page, pageSize: query.page_size });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      created_at: user.createdAt.toISOString()
    }));
  },

    // Cadastro público: cria pesquisador, perfil, dados acadêmicos e COEP numa transação só. A role nunca vem do cliente, é sempre researcher.
  createUser: async (
    data: CreatePublicUserInput,
    document: UploadedCoepDocument
  ): Promise<PublicUserCreatedResponse> => {
    const existing = await usersRepository.findByEmail(data.email);

    if (existing) {
      throw new AppError("User with this email already exists", 409);
    }

    const hashedPassword = await hash(data.password, 10);

    const storedDocument = await storeCoepDocument(document);
    let created;

    try {
      // Traduz snake_case (formato da requisição) para camelCase (formato do Prisma) e converte a data para o tipo que a coluna DATE espera.
      created = await usersRepository.createResearcherWithProfile({
        fullName: data.full_name,
        email: data.email,
        hashedPassword,
        accountStatus: "pending",
        profile: {
          phone: data.profile.phone,
          institution: data.profile.institution,
          organizationalUnit: data.profile.organizational_unit,
          contactAddress: data.profile.contact_address
        },
        researcherProfile: {
          researchArea: data.researcher_profile.research_area,
          position: data.researcher_profile.position
        },
        coep: {
          caae: data.coep.caae,
          opinionNumber: data.coep.opinion_number,
          approvalDate: new Date(`${data.coep.approval_date}T00:00:00.000Z`),
          documentFilename: storedDocument.filename,
          documentStoragePath: storedDocument.storagePath
        }
      });

    } catch (error) {
      await removeStoredCoepDocument(storedDocument.storagePath);
      throw error;
    }

    // Volta para snake_case na resposta. Campos montados um a um: nada é repassado em bloco, então senha, hash e caminho de armazenamento não têm como escapar por descuido.
    return {
      id: created.user.id,
      email: created.user.email,
      full_name: created.user.fullName,
      role: created.user.role,
      created_at: created.user.createdAt.toISOString(),
      profile: {
        phone: created.profile.phone ?? "",
        institution: created.profile.institution ?? "",
        organizational_unit: created.profile.organizationalUnit ?? "",
        contact_address: created.profile.contactAddress ?? ""
      },
      researcher_profile: {
        research_area: created.researcherProfile.researchArea ?? "",
        position: created.researcherProfile.position ?? ""
      },
      coep: {
        caae: created.coep.caae,
        opinion_number: created.coep.opinionNumber,
        // Só a parte da data, sem hora: a coluna é DATE.
        approval_date: created.coep.approvalDate.toISOString().slice(0, 10),
        document_filename: created.coep.documentFilename
      }
    };
  },

  createResearcher: async (
    data: CreateResearcherInput,
    document: UploadedCoepDocument,
    adminId: number,
  ): Promise<UserResponse> => {
    const { hashedPassword } = await prepareUserData(data.email, data.password);

    const storedDocument = await storeCoepDocument(document);
    let user;

    try {
      user = await usersRepository.createResearcher(
        {
          user: {
            fullName: data.full_name,
            email: data.email,
            hashedPassword,
            role: "researcher",
            accountStatus: "active",
          },
          profile: {
            phone: data.profile.phone,
            institution: data.profile.institution,
            organizationalUnit: data.profile.organizational_unit,
            contactAddress: data.profile.contact_address,
          },
          researcherProfile: {
            researchArea: data.researcher_profile.research_area,
            position: data.researcher_profile.position,
          },
          coep: {
            caae: data.coep.caae,
            opinionNumber: data.coep.opinion_number,
            approvalDate: new Date(`${data.coep.approval_date}T00:00:00.000Z`),
            documentFilename: storedDocument.filename,
            documentStoragePath: storedDocument.storagePath,
          },
          evaluation: {
            status: "active",
            evaluatedByUserId: adminId,
            evaluatedAt: new Date(),
          },
        },
        { actorUserId: adminId, role: "researcher", email: data.email },
      );
    } catch (error) {
      await removeStoredCoepDocument(storedDocument.storagePath);
      throw error;
    }

    return toUserResponse(user);
  },

  createCommitteeMember: async (
    data: CreateCommitteeMemberInput,
    adminId: number,
  ): Promise<UserResponse> => {
    const specialty = await specialtiesRepository.findById(data.specialty_id);
    if (!specialty || !specialty.isActive) {
      throw new AppError("Especialidade inválida ou inativa", 400);
    }

    const { hashedPassword } = await prepareUserData(data.email, data.password);

    const user = await usersRepository.createCommitteeMember(
      {
        user: {
          fullName: data.full_name,
          email: data.email,
          hashedPassword,
          role: "committee",
          accountStatus: "active",
        },
        committeeMemberProfile: { specialtyId: data.specialty_id },
        evaluation: {
          status: "active",
          evaluatedByUserId: adminId,
          evaluatedAt: new Date(),
        },
      },
      { actorUserId: adminId, role: "committee", email: data.email },
    );

    return toUserResponse(user);
  },

  createAdministrator: async (
    data: CreateAdministratorInput,
    adminId: number,
  ): Promise<UserResponse> => {
    const { hashedPassword } = await prepareUserData(data.email, data.password);

    const user = await usersRepository.createAdministrator(
      {
        fullName: data.full_name,
        email: data.email,
        hashedPassword,
        role: "admin",
        accountStatus: "active",
      },
      { actorUserId: adminId, role: "admin", email: data.email },
    );

    return toUserResponse(user);
  },

  createAuthEvaluation: async (
    userId: number,
    data: CreateUserAuthEvaluationInput,
    currentUser: AuthenticatedUser
  ): Promise<UserAuthEvaluationResponse> => {
    const target = await usersRepository.findAuthEvaluationTarget(userId);

    if (!target) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (target.role !== "researcher" || !target.researcherProfile) {
      throw new AppError("O usuário não possui perfil de pesquisador", 400);
    }

    if (!AUTH_REVIEW_TRANSITIONS[target.accountStatus].includes(data.status)) {
      throw new AppError(
        `Transição de ${target.accountStatus} para ${data.status} não permitida`,
        409
      );
    }

    const justification = data.justification?.trim() || null;
    if (data.status === "rejected" && !justification) {
      throw new AppError("Justificativa é obrigatória para rejeição", 400);
    }

    const evaluation = await usersRepository.createAuthEvaluation({
      userId,
      expectedStatus: target.accountStatus,
      status: data.status,
      justification,
      evaluatedByUserId: currentUser.id
    });

    return {
      id: evaluation.id,
      user_id: evaluation.userId,
      status: evaluation.status,
      justification: evaluation.justification,
      evaluated_by_user_id: evaluation.evaluatedByUserId,
      evaluated_at: evaluation.evaluatedAt.toISOString(),
      created_at: evaluation.createdAt.toISOString(),
      user_coep_data_id: evaluation.userCoepDataId
    };
  },

  getCoepDocument: async (userId: number, currentUser: AuthenticatedUser) => {
    const canDownloadAnyResearcherDocument = currentUser.role === "admin" || currentUser.role === "committee";
    const isOwnDocument = currentUser.role === "researcher" && currentUser.id === userId;

    if (!canDownloadAnyResearcherDocument && !isOwnDocument) {
      throw new AppError("Você não pode baixar este documento", 403);
    }

    const user = await usersRepository.findCoepDocument(userId);
    const document = user?.coepData[0];

    if (!user || user.role !== "researcher" || !user.researcherProfile || !document) {
      throw new AppError("Documento do COEP não encontrado", 404);
    }

    return {
      filePath: await resolveStoredCoepDocument(document.documentStoragePath),
      filename: basename(document.documentFilename) || `parecer-coep-${userId}.pdf`
    };
  },
};
