import { hash } from "bcryptjs";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import { usersRepository } from "../repositories/users-repository.js";
import { CreatePublicUserInput, CreateUserByAdminInput, ListUsersQuery, UserResponse } from "../schemas/user-schema.js";

// Parte comum aos dois cadastros: checa duplicidade, faz o hash, grava.
// Só muda quem decide a role.
const saveUser = async (
  data: CreatePublicUserInput,
  role: UserRole,
  accountStatus: "pending" | "active"
): Promise<UserResponse> => {
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
    role,
    accountStatus
  });

  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
    account_status: user.accountStatus,
    is_active: user.accountStatus === "active",
    created_at: user.createdAt.toISOString()
  };
};

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
      account_status: user.accountStatus,
      is_active: user.accountStatus === "active",
      created_at: user.createdAt.toISOString()
    }));
  },

  // Cadastro público: role nunca vem do cliente, é sempre researcher.
  createUser: (data: CreatePublicUserInput) => saveUser(data, "researcher", "pending"),

  // A rota já garantiu que quem chama é admin, então aceita a role enviada.
  createUserByAdmin: (data: CreateUserByAdminInput) => saveUser(data, data.role, "active")
};
