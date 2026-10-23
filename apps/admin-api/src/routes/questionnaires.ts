import { Router } from "express";
import { questionnairesController } from "../controllers/questionnaires-controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.js";

export const questionnairesRouter = Router();

/**
 * @swagger
 * /admin/questionnaires:
 *   get:
 *     summary: Lista versões de questionários
 *     tags: [Questionnaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: key
 *         description: Filtra as versões de uma família de questionários
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
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
 *         description: Lista paginada de versões
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionnairesListResponse'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas administradores podem gerenciar questionários
 */
questionnairesRouter.get("/", authenticate, restrictTo("admin"), questionnairesController.list);

/**
 * @swagger
 * /admin/questionnaires:
 *   post:
 *     summary: Cria uma versão de questionário em rascunho
 *     description: Recebe chave, título e seções dinâmicas. A API gera a próxima versão sequencial por chave, começando em 1. Na interface, exibir 1.0, 2.0 etc. Para copiar uma versão existente, envie suas seções mantendo chave e título. Não envie version.
 *     tags: [Questionnaires]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionnaireInput'
 *     responses:
 *       201:
 *         description: Versão criada como inativa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionnaireResponse'
 *       400:
 *         description: JSON fora do contrato do questionário
 *       409:
 *         description: Conflito de concorrência ou limite de versões atingido
 */
questionnairesRouter.post("/", authenticate, restrictTo("admin"), questionnairesController.create);

/**
 * @swagger
 * /admin/questionnaires/{id}:
 *   get:
 *     summary: Consulta uma versão de questionário
 *     tags: [Questionnaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Questionário completo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionnaireResponse'
 *       404:
 *         description: Questionário não encontrado
 */
questionnairesRouter.get("/:id", authenticate, restrictTo("admin"), questionnairesController.get);

/**
 * @swagger
 * /admin/questionnaires/{id}:
 *   patch:
 *     summary: Edita as seções de uma versão ainda não publicada
 *     description: Substitui todas as seções. Chave, título e versão são imutáveis. Uma versão publicada, mesmo inativa, não pode ser editada.
 *     tags: [Questionnaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestionnaireInput'
 *     responses:
 *       200:
 *         description: Versão salva sem alterar sua identificação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionnaireResponse'
 *       400:
 *         description: Conteúdo inválido ou tentativa de alterar a identificação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas administradores podem editar questionários
 *       404:
 *         description: Questionário não encontrado
 *       409:
 *         description: Versão já publicada ou conflito de concorrência
 */
questionnairesRouter.patch("/:id", authenticate, restrictTo("admin"), questionnairesController.update);

/**
 * @swagger
 * /admin/questionnaires/{id}/publish:
 *   post:
 *     summary: Publica uma versão imutável do questionário
 *     description: Publica uma versão salva e desativa a anterior da mesma chave. Publicar novamente a versão já ativa é idempotente e preserva published_at. Uma versão publicada anteriormente e inativa não pode ser republicada.
 *     tags: [Questionnaires]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Questionário publicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionnaireResponse'
 *       404:
 *         description: Questionário não encontrado
 *       409:
 *         description: Versão publicada anteriormente ou conflito de concorrência
 */
questionnairesRouter.post("/:id/publish", authenticate, restrictTo("admin"), questionnairesController.publish);
