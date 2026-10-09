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

/**
 * @swagger
 * /admin/auth/me:
 *   patch:
 *     summary: Edita o próprio perfil
 *     description: >
 *       Atualiza apenas nome, e-mail e senha do usuário autenticado. O alvo da
 *       edição vem do token, nunca do corpo. Campos fora da lista permitida
 *       (role, account_status, user_id e afins) são recusados com 400, assim
 *       como o corpo vazio. Trocar a senha exige enviar current_password.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMe'
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthenticatedUserResponse'
 *       400:
 *         description: Dados inválidos, campo não permitido, corpo vazio ou senha atual incorreta
 *       401:
 *         description: Não autenticado
 *       409:
 *         description: E-mail já utilizado por outro usuário
 */
authRouter.patch("/me", authenticate, authController.updateMe);
