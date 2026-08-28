import { usersRepository } from "../repositories/users-repository.js";
import { CreateUserInput } from "../schemas/user-schema.js";
import { hash } from "bcryptjs";

export class UsersService {
  private usersRepository: usersRepository;

  constructor() {
    this.usersRepository = new usersRepository();
  }

  async createUser(data: CreateUserInput) {
    const existing = await this.usersRepository.findByEmail(data.email);

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await hash(data.password, 10);

    const user = await this.usersRepository.create({
      fullName: data.full_name,
      email: data.email,
      hashedPassword,
      role: data.role,
    });

    return {
      id: user.id,
      full_name: user.fullName,
      email: user.email,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt,
    };
  }
}
