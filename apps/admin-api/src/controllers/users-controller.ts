import { Request, Response } from "express";
import { UsersService } from "../services/users-service.js";
import { createUserSchema } from "../schemas/user-schema.js";
import { ZodError } from "zod";

const usersService = new UsersService();

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body);

      const user = await usersService.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ errors: error.errors });
      } else if (error instanceof Error && error.message === "User with this email already exists") {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
