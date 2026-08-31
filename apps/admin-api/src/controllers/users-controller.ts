import { NextFunction, Request, Response } from "express";
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
  }
};
