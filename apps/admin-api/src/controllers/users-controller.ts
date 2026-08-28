import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { createUserSchema } from "../schemas/user-schema.js";
import { usersService } from "../services/users-service.js";

export const usersController = {
  list: async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const users = await usersService.listUsers();
      response.status(200).json(users);
    } catch (error) {
      // next(error) entrega o erro pro Express, que devolve um 500 pra
      // quem chamou. Sem isso, um erro dentro de uma função async some
      // sem virar resposta nenhuma.
      next(error);
    }
  },

  create: async (request: Request, response: Response) => {
    try {
      const data = createUserSchema.parse(request.body);
      const user = await usersService.createUser(data);
      response.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        response.status(400).json({ errors: error.errors });
        return;
      }

      if (error instanceof Error && error.message === "User with this email already exists") {
        response.status(409).json({ error: error.message });
        return;
      }

      response.status(500).json({ error: "Internal server error" });
    }
  }
};
