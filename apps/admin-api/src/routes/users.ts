import { Router } from "express";
import { usersController } from "../controllers/users-controller.js";

export const usersRouter = Router();

// Montado em "/api/admin/users" no app.ts, então isso vira GET/POST /api/admin/users.
usersRouter.get("/", usersController.list);
usersRouter.post("/", usersController.create);
