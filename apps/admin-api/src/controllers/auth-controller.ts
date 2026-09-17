import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { authService } from "../services/auth-service.js";
import { loginSchema } from "../schemas/auth-schema.js";

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

      response.status(200).json({
        id: request.user.id,
        email: request.user.email,
        full_name: request.user.fullName,
        role: request.user.role,
        is_active: request.user.isActive
      });
    } catch (error) {
      next(error);
    }
  }
};
