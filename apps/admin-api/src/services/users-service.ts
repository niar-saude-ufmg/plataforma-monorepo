import { usersRepository } from "../repositories/users-repository.js";
import { hash } from "bcryptjs";
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
      throw new Error("User with this email already exists");
    }

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
