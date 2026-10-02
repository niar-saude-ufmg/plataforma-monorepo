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
 *     deprecated: true
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

/**
 * @swagger
 * /admin/users/researchers:
 *   post:
 *     summary: Cria um pesquisador
 *     description: Só admin autenticado pode criar pesquisadores.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResearcher'
 *     responses:
 *       201:
 *         description: Pesquisador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos (validação do Zod)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Autenticado, mas não é admin
 *       409:
 *         description: E-mail já cadastrado
 */
usersRouter.post("/researchers", authenticate, restrictTo("admin"), usersController.createResearcher);

/**
 * @swagger
 * /admin/users/committee-members:
 *   post:
 *     summary: Cria um membro do comitê
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommitteeMember'
 *     responses:
 *       201:
 *         description: Membro do comitê criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos ou especialidade inválida
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não é admin
 *       409:
 *         description: E-mail já cadastrado
 */
usersRouter.post("/committee-members", authenticate, restrictTo("admin"), usersController.createCommitteeMember);

/**
 * @swagger
 * /admin/users/administrators:
 *   post:
 *     summary: Cria um administrador
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdministrator'
 *     responses:
 *       201:
 *         description: Administrador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Não é admin
 *       409:
 *         description: E-mail já cadastrado
 */
usersRouter.post("/administrators", authenticate, restrictTo("admin"), usersController.createAdministrator);
