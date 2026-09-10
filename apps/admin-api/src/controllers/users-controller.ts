import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { createPublicUserSchema, createUserByAdminSchema, listUsersQuerySchema } from "../schemas/user-schema.js";
import { usersService } from "../services/users-service.js";

export const usersController = {
  list: async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!request.user) {
        throw new AppError("Não autenticado", 401);
      }

      const query = listUsersQuerySchema.parse(request.query);
      const users = await usersService.listUsers(query, request.user);
      response.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },

  create: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const data = createPublicUserSchema.parse(request.body);
      const user = await usersService.createUser(data);
      response.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  createByAdmin: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const data = createUserByAdminSchema.parse(request.body);
      const user = await usersService.createUserByAdmin(data);
      response.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
};
