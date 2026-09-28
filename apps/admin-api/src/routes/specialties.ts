import { Router } from "express";
import { specialtiesController } from "../controllers/specialties-controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.js";

export const specialtiesRouter = Router();

// Montado em "/api/admin/specialties" no app.ts. Só admin gerencia o
// catálogo: associar especialidades a projetos/comissão fica para outro card.

/**
 * @swagger
 * /admin/specialties:
 *   get:
 *     summary: Lista o catálogo de especialidades (protegido, só admin)
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
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
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de especialidades
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Autenticado, mas não é admin
 */
specialtiesRouter.get("/", authenticate, restrictTo("admin"), specialtiesController.list);

/**
 * @swagger
 * /admin/specialties:
 *   post:
 *     summary: Cria uma especialidade no catálogo (protegido, só admin)
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Especialidade criada com sucesso
 *       400:
 *         description: Dados inválidos (validação do Zod)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Autenticado, mas não é admin
 *       409:
 *         description: Código ou nome já cadastrado
 */
specialtiesRouter.post("/", authenticate, restrictTo("admin"), specialtiesController.create);

/**
 * @swagger
 * /admin/specialties/{id}:
 *   patch:
 *     summary: Edita nome/descrição/contexto de orientação (protegido, só admin)
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Especialidade atualizada
 *       400:
 *         description: Dados inválidos (validação do Zod)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Autenticado, mas não é admin
 *       404:
 *         description: Especialidade não encontrada
 *       409:
 *         description: Nome já cadastrado
 */
specialtiesRouter.patch("/:id", authenticate, restrictTo("admin"), specialtiesController.update);

/**
 * @swagger
 * /admin/specialties/{id}/status:
 *   patch:
 *     summary: Ativa ou desativa uma especialidade (protegido, só admin)
 *     description: Desativar não apaga o registro, só marca is_active como false.
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Especialidade atualizada
 *       400:
 *         description: Dados inválidos (validação do Zod)
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Autenticado, mas não é admin
 *       404:
 *         description: Especialidade não encontrada
 */
specialtiesRouter.patch("/:id/status", authenticate, restrictTo("admin"), specialtiesController.updateStatus);
