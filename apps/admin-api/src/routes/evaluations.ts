import { Router } from "express";
import { evaluationsController } from "../controllers/evaluations-controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.js";

export const evaluationsRouter = Router();

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/evaluation:
 *   post:
 *     summary: Atribui uma versão para avaliação ou permite que o responsável a assuma
 *     tags: [Evaluations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: project_version_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assigned_to_user_id: { type: integer }
 *     responses:
 *       201: { description: Avaliação atribuída }
 *       400: { description: Payload ou responsável inválido }
 *       403: { description: Papel sem permissão }
 *       409: { description: Versão já atribuída }
 */
evaluationsRouter.post(
  "/:project_version_id/evaluation",
  authenticate,
  restrictTo("admin", "auditor", "committee"),
  evaluationsController.assign
);

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/evaluation:
 *   get:
 *     summary: Consulta a avaliação unificada da versão
 *     tags: [Evaluations]
 *     security: [{ bearerAuth: [] }]
 */
evaluationsRouter.get(
  "/:project_version_id/evaluation",
  authenticate,
  restrictTo("admin", "auditor", "committee"),
  evaluationsController.get
);

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/evaluation:
 *   put:
 *     summary: Registra uma decisão do auditor ou do comitê
 *     tags: [Evaluations]
 *     security: [{ bearerAuth: [] }]
 */
evaluationsRouter.put(
  "/:project_version_id/evaluation",
  authenticate,
  restrictTo("auditor", "committee"),
  evaluationsController.update
);
