import { usersRepository } from "../repositories/users-repository.js";
import { UserResponse } from "../schemas/user-schema.js";

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
  }
};
