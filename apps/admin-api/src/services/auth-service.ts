import { compare } from "bcryptjs";
import { AppError } from "../errors/app-error.js";
import { signAccessToken } from "../middlewares/auth.js";
import { usersRepository } from "../repositories/users-repository.js";
import { LoginInput } from "../schemas/auth-schema.js";

export const authService = {
  login: async (data: LoginInput): Promise<{ access_token: string; token_type: string }> => {
    const user = await usersRepository.findByEmail(data.email);

    // Mesma mensagem genérica pros dois casos (email não existe ou senha
    // errada). Não dá pra alguém descobrir se um email está cadastrado
    // só tentando logar com ele.
    if (!user) {
      throw new AppError("Credenciais incorretas", 401);
    }

    const passwordMatches = await compare(data.password, user.hashedPassword);
    if (!passwordMatches) {
      throw new AppError("Credenciais incorretas", 401);
    }

    if (user.accountStatus !== "active") {
      throw new AppError("Conta não está ativa", 403);
    }

    return {
      access_token: signAccessToken(user.id),
      token_type: "bearer"
    };
  }
};
