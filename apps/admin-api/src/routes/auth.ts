import { Router } from "express";
import { authController } from "../controllers/auth-controller.js";
import { authenticate } from "../middlewares/auth.js";

export const authRouter = Router();

// Montado em "/api/admin/auth" no app.ts, então isso vira
// POST /api/admin/auth/login e GET /api/admin/auth/me.

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais incorretas
 *       403:
 *         description: Conta desativada
 */
authRouter.post("/login", authController.login);

/**
 * @swagger
 * /admin/auth/me:
 *   get:
 *     summary: Usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *       401:
 *         description: Não autenticado
 */
authRouter.get("/me", authenticate, authController.me);
