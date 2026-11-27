import { Router } from "express";
import { projectSectionTemplatesController } from "../controllers/project-section-templates-controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.js";

export const projectSectionTemplatesRouter = Router();

/**
 * @swagger
 * /admin/project-section-templates:
 *   get:
 *     summary: Lista versões de modelos de seções
 *     tags: [ProjectSectionTemplates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: template_key
 *         description: Filtra as versões de uma família de modelos
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
 *               $ref: '#/components/schemas/ProjectSectionTemplatesListResponse'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas administradores podem gerenciar modelos de seções
 */
projectSectionTemplatesRouter.get("/", authenticate, restrictTo("admin"), projectSectionTemplatesController.list);

/**
 * @swagger
 * /admin/project-section-templates:
 *   post:
 *     summary: Cria uma versão de modelo de seções em rascunho
 *     description: Recebe chave, nome e definição das seções. A API gera a próxima versão sequencial por chave, começando em 1. Para copiar uma versão existente, envie sua definição mantendo a chave. Não envie version.
 *     tags: [ProjectSectionTemplates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectSectionTemplateInput'
 *     responses:
 *       201:
 *         description: Versão criada como inativa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectSectionTemplateResponse'
 *       400:
 *         description: JSON fora do contrato do modelo de seções
 *       409:
 *         description: Conflito de concorrência ou limite de versões atingido
 */
projectSectionTemplatesRouter.post("/", authenticate, restrictTo("admin"), projectSectionTemplatesController.create);

/**
 * @swagger
 * /admin/project-section-templates/{id}:
 *   get:
 *     summary: Consulta uma versão de modelo de seções
 *     tags: [ProjectSectionTemplates]
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
 *         description: Modelo de seções completo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectSectionTemplateResponse'
 *       404:
 *         description: Modelo de seções não encontrado
 */
projectSectionTemplatesRouter.get("/:id", authenticate, restrictTo("admin"), projectSectionTemplatesController.get);

/**
 * @swagger
 * /admin/project-section-templates/{id}:
 *   put:
 *     summary: Edita uma versão ainda não publicada
 *     description: Substitui nome e definição completa das seções. A chave e a versão são imutáveis. Uma versão publicada, mesmo inativa, não pode ser editada.
 *     tags: [ProjectSectionTemplates]
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
 *             $ref: '#/components/schemas/UpdateProjectSectionTemplateInput'
 *     responses:
 *       200:
 *         description: Versão salva sem alterar sua identificação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectSectionTemplateResponse'
 *       400:
 *         description: Conteúdo inválido ou tentativa de alterar a identificação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Apenas administradores podem editar modelos de seções
 *       404:
 *         description: Modelo de seções não encontrado
 *       409:
 *         description: Versão já publicada ou conflito de concorrência
 */
projectSectionTemplatesRouter.put("/:id", authenticate, restrictTo("admin"), projectSectionTemplatesController.update);

/**
 * @swagger
 * /admin/project-section-templates/{id}/publish:
 *   post:
 *     summary: Publica uma versão do modelo de seções
 *     description: Publica a versão e desativa a anterior da mesma chave. Publicar novamente a versão já ativa é idempotente e preserva published_at. Uma versão publicada anteriormente e inativa não pode ser republicada.
 *     tags: [ProjectSectionTemplates]
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
 *         description: Modelo de seções publicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectSectionTemplateResponse'
 *       404:
 *         description: Modelo de seções não encontrado
 *       409:
 *         description: Versão publicada anteriormente ou conflito de concorrência
 */
projectSectionTemplatesRouter.post("/:id/publish", authenticate, restrictTo("admin"), projectSectionTemplatesController.publish);
