import { usersRepository } from "../repositories/users-repository.js";
import { hash } from "bcryptjs";
import { AppError } from "../errors/app-error.js";
import { CreateUserInput, UserResponse } from "../schemas/user-schema.js";

export const usersService = {
  listUsers: async (): Promise<UserResponse[]> => {
    const users = await usersRepository.findAll();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt.toISOString()
    }));
  },

  createUser: async (data: CreateUserInput): Promise<UserResponse> => {
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
      role: data.role
    });

    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt.toISOString()
    };
  }
};
