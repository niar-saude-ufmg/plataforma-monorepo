import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import { usersRepository } from "../repositories/users-repository.js";

export type AuthenticatedUser = {
  id: number;
  role: UserRole;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Token só carrega "sub" (id) e "exp", sem role. Depois de validado, é
// preciso buscar o usuário no banco — mesma lógica usada no deps.py
// do assistente.
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

    request.user = { id: user.id, role: user.role };
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
