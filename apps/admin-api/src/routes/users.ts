import { Router } from "express";
import { usersController } from "../controllers/users-controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.js";

export const usersRouter = Router();

// Montado em "/api/admin/users" no app.ts, então isso vira
// GET/POST /api/admin/users e POST /api/admin/users/internal.

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lista usuários (protegido)
 *     description: Admin vê qualquer papel. Committee só vê researcher, mesmo sem filtro.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [researcher, admin, committee]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Papel sem acesso à listagem, ou fora do escopo permitido
 */
usersRouter.get("/", authenticate, restrictTo("admin", "committee"), usersController.list);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Cadastro público de pesquisador
 *     description: Sempre cria role "researcher", independente do que for enviado.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos (validação do Zod)
 *       409:
 *         description: E-mail já cadastrado
 */
usersRouter.post("/", usersController.create);

/**
 * @swagger
 * /admin/users/internal:
 *   post:
 *     summary: Cadastro administrativo (protegido)
 *     description: Só admin autenticado. Aceita qualquer papel (researcher, admin, committee).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos (validação do Zod)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Autenticado, mas não é admin
 *       409:
 *         description: E-mail já cadastrado
 */
usersRouter.post("/internal", authenticate, restrictTo("admin"), usersController.createByAdmin);
