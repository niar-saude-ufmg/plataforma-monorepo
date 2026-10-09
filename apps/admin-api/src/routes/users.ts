import { Router } from "express";
import { usersController } from "../controllers/users-controller.js";
import { uploadCoepDocument } from "../middlewares/coep-upload.js";
import { authenticate, restrictTo } from "../middlewares/auth.js";

export const usersRouter = Router();

// Montado em "/api/admin/users" no app.ts, então isso vira
// GET/POST /api/admin/users e as rotas administrativas específicas abaixo.

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lista dados consolidados dos usuários
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
 *         name: account_status
 *         description: Filtra usuários pelo status atual da conta.
 *         schema:
 *           type: string
 *           enum: [pending, active, rejected, disabled]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Página de usuários com perfil, COEP e última avaliação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsersResponse'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Papel sem acesso à listagem, ou fora do escopo permitido
 */
usersRouter.get("/", authenticate, restrictTo("admin", "committee"), usersController.list);

/**
 * @swagger
 * /admin/users/{user_id}:
 *   get:
 *     summary: Consulta os dados consolidados de um usuário
 *     description: Admin consulta qualquer papel. Committee consulta somente pesquisadores.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Usuário com perfil, COEP e última avaliação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsolidatedUserResponse'
 *       400:
 *         description: Identificador inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Pesquisador não pode consultar usuários
 *       404:
 *         description: Usuário inexistente ou fora do escopo do comitê
 */
usersRouter.get("/:user_id", authenticate, restrictTo("admin", "committee"), usersController.detail);

/**
 * @swagger
 * /admin/users/{user_id}/auth-evaluation:
 *   post:
 *     summary: Registra a revisão do cadastro de um pesquisador
 *     description: >
 *       Usa o status compartilhado pending, active, rejected ou disabled.
 *       Este fluxo permite somente pending -> active e pending -> rejected.
 *       Contas active, rejected ou disabled não podem ser alteradas por este endpoint.
 *       A justificativa é obrigatória para rejected. Cada decisão cria uma nova
 *       avaliação e atualiza a conta na mesma transação.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, active, rejected, disabled]
 *               justification:
 *                 type: string
 *           examples:
 *             approval:
 *               value: { status: active, justification: "Cadastro aprovado." }
 *             rejection:
 *               value: { status: rejected, justification: "O parecer do COEP precisa ser corrigido." }
 *     responses:
 *       201:
 *         description: Revisão registrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAuthEvaluationResponse'
 *       400:
 *         description: Payload inválido, justificativa ausente ou usuário sem perfil de pesquisador
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Pesquisador não pode registrar revisões
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: Transição de status não permitida ou revisão concorrente
 */
usersRouter.post(
  "/:user_id/auth-evaluation",
  authenticate,
  restrictTo("admin", "committee"),
  usersController.createAuthEvaluation
);

/**
 * @swagger
 * /admin/users/{user_id}/coep-document:
 *   get:
 *     summary: Baixa o parecer do COEP de um pesquisador
 *     description: Retorna o PDF com o nome original sem expor o caminho interno de armazenamento.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Parecer do COEP
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Pesquisador não pode baixar o documento por este endpoint
 *       404:
 *         description: Usuário, parecer ou arquivo não encontrado
 */
usersRouter.get(
  "/:user_id/coep-document",
  authenticate,
  restrictTo("admin", "committee"),
  usersController.downloadCoepDocument
);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Cadastro público de pesquisador
 *     description: >
 *       Sempre cria role "researcher", independente do que for enviado.
 *       Grava usuário, perfil de contato, dados acadêmicos e parecer do COEP
 *       na mesma transação: se qualquer etapa falhar, nada é persistido.
 *       Os blocos profile, researcher_profile e coep são JSON dentro do multipart/form-data,
 *       e o arquivo deve ser enviado no campo coep_document.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUserCreatedResponse'
 *       400:
 *         description: Dados inválidos (validação do Zod)
 *       409:
 *         description: E-mail já cadastrado
 */
usersRouter.post("/", uploadCoepDocument, usersController.create);

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
 *         multipart/form-data:
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
usersRouter.post(
  "/researchers",
  authenticate,
  restrictTo("admin"),
  uploadCoepDocument,
  usersController.createResearcher
);

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
