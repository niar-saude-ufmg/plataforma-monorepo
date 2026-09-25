import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import { usersRepository } from "../repositories/users-repository.js";

// email/fullName/accountStatus entraram aqui (além de id/role) para o GET /me não
// precisar buscar o usuário de novo no banco — authenticate já fez essa
// consulta, então só reaproveitamos os campos.
export type AuthenticatedUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: "pending" | "active" | "rejected" | "disabled";
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

// Falha alto e cedo (na subida do servidor) se a variável não estiver
// configurada, em vez de cair num fallback silencioso ("") que faria login
// virar 500 genérico e authenticate virar 401 em tudo, sem indicar a causa.
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error("SECRET_KEY não configurada");
}

export const signAccessToken = (userId: number): string =>
  jwt.sign({ sub: String(userId) }, SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });

// Token só carrega "sub" (id) e "exp", sem role. Depois de validado, busca o usuário no banco.
export const authenticate = async (request: Request, _response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError("Token não informado", 401));
    return;
  }

  const token = authHeader.slice("Bearer ".length);
  let userId: number;

  // Só a decodificação do token fica neste try/catch: qualquer problema
  // aqui (assinatura errada, expirado, formato inesperado) é mesmo "token
  // inválido". A busca no banco, abaixo, tem seu próprio tratamento — se
  // ela falhar, não deve virar "token inválido" também.
  try {
    const payload = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] });

    if (typeof payload !== "object" || payload === null) {
      throw new Error("payload sem o formato esperado");
    }

    userId = Number(payload.sub);
    if (!Number.isInteger(userId)) {
      throw new Error("sub inválido");
    }
  } catch {
    next(new AppError("Token inválido", 401));
    return;
  }

  try {
    const user = await usersRepository.findById(userId);
    if (!user || user.accountStatus !== "active") {
      throw new AppError("Usuário não encontrado", 401);
    }

    request.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      accountStatus: user.accountStatus
    };
    next();
  } catch (error) {
    // AppError ("Usuário não encontrado") segue com seu próprio status;
    // um erro real de banco vira 500 pelo handler central, honesto sobre
    // o que de fato falhou.
    next(error);
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
