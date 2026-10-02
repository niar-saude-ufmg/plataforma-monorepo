import { hash } from "bcryptjs";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import { usersRepository } from "../repositories/users-repository.js";
import { specialtiesRepository } from "../repositories/specialties-repository.js";
import { auditRepository } from "../repositories/audit-repository.js";
import {
  CreateAdministratorInput,
  CreateUserByAdminInput,
  CreateCommitteeMemberInput,
  CreatePublicUserInput,
  CreateResearcherInput,
  ListUsersQuery,
  UserResponse,
} from "../schemas/user-schema.js";

// Parte comum aos dois cadastros: checa duplicidade, faz o hash, grava.
// Só muda quem decide a role.
const saveUser = async (data: CreatePublicUserInput, role: UserRole): Promise<UserResponse> => {
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
    is_active: user.accountStatus === "active",
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
  is_active: user.accountStatus === "active",
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
      is_active: user.accountStatus === "active",
      created_at: user.createdAt.toISOString()
    }));
  },

  // Cadastro público: role nunca vem do cliente, é sempre researcher.
  createUser: (data: CreatePublicUserInput) => saveUser(data, "researcher"),

  // A rota já garantiu que quem chama é admin, então aceita a role enviada.
  createUserByAdmin: (data: CreateUserByAdminInput) => saveUser(data, data.role),

  createResearcher: async (
    data: CreateResearcherInput,
    adminId: number,
  ): Promise<UserResponse> => {
    const { hashedPassword } = await prepareUserData(data.email, data.password);

    const user = await usersRepository.createResearcher({
      user: {
        fullName: data.full_name,
        email: data.email,
        hashedPassword,
        role: "researcher",
        accountStatus: "active",
      },
      profile: data.profile,
      researcherProfile: data.researcher_profile,
      coep: {
        caae: data.coep.caae,
        opinionNumber: data.coep.opinion_number,
        approvalDate: data.coep.approval_date,
        documentFilename: data.coep.document_filename,
        documentStoragePath: data.coep.document_storage_path,
      },
      evaluation: {
        status: "active",
        evaluatedByUserId: adminId,
        evaluatedAt: new Date(),
      },
    });

    await auditRepository.create({
      userId: adminId,
      action: "create_researcher",
      resourceType: "user",
      resourceId: String(user.id),
      details: `Created researcher user with email ${user.email}`,
    });

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

    const user = await usersRepository.createCommitteeMember({
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
    });

    await auditRepository.create({
      userId: adminId,
      action: "create_committee_member",
      resourceType: "user",
      resourceId: String(user.id),
      details: `Created commitee member user with email ${user.email}`,
    });

    return toUserResponse(user);
  },

  createAdministrator: async (
    data: CreateAdministratorInput,
    adminId: number,
  ): Promise<UserResponse> => {
    const { hashedPassword } = await prepareUserData(data.email, data.password);

    const user = await usersRepository.createAdministrator({
      fullName: data.full_name,
      email: data.email,
      hashedPassword,
      role: "admin",
      accountStatus: "active",
    });

    await auditRepository.create({
      userId: adminId,
      action: "create_administrator",
      resourceType: "user",
      resourceId: String(user.id),
      details: `Created administrator user with email ${user.email}`,
    });

    return toUserResponse(user);
  },
};
