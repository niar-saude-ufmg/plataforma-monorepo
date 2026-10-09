import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { authService } from "../services/auth-service.js";
import { loginSchema, updateMeSchema } from "../schemas/auth-schema.js";

export const authController = {
  login: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(request.body);
      const token = await authService.login(data);
      response.status(200).json(token);
    } catch (error) {
      next(error);
    }
  },

  me: (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!request.user) {
        throw new AppError("Não autenticado", 401);
      }

      response.status(200).json(authService.getSession(request.user));
    } catch (error) {
      next(error);
    }
  },

  updateMe: async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!request.user) {
        throw new AppError("Não autenticado", 401);
      }

      // O id usado na edição é o do token. O corpo só traz os campos editáveis — e o schema recusa qualquer outro.
      const data = updateMeSchema.parse(request.body);
      const updated = await authService.updateMe(request.user.id, data);
      response.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
};
