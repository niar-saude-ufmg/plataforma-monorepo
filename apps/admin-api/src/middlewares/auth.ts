import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import { usersRepository } from "../repositories/users-repository.js";

// email/fullName/isActive entraram aqui (além de id/role) para o GET /me não
// precisar buscar o usuário de novo no banco — authenticate já fez essa
// consulta, então só reaproveitamos os campos.
export type AuthenticatedUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
};

declare global 
{
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// 480 minutos (8h) é o mesmo tempo de expiração que o assistente já usa
// (access_token_expire_minutes em app/core/config.py), pra manter a sessão
// com a mesma duração depois da migração.
const ACCESS_TOKEN_EXPIRES_IN = "8h";

export const signAccessToken = (userId: number): string =>
  jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY ?? "", {
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });

// Token só carrega "sub" (id) e "exp", sem role. Depois de validado, busca o usuário no banco.
export const authenticate = async (request: Request, _response: Response, next: NextFunction) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Token não informado", 401);
    }

    const token = authHeader.slice("Bearer ".length);
    const payload = jwt.verify(token, process.env.SECRET_KEY ?? "", { algorithms: ["HS256"] });

    if (typeof payload !== "object" || payload === null) {
      throw new AppError("Token inválido", 401);
    }

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) {
      throw new AppError("Token inválido", 401);
    }

    const user = await usersRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError("Usuário não encontrado", 401);
    }

    request.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive
    };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Token inválido", 401));
  }
};

export const restrictTo = (...allowedRoles: UserRole[]) => {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      next(new AppError("Não autenticado", 401));
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(new AppError("Acesso negado para este papel", 403));
      return;
    }

    next();
  };
};
