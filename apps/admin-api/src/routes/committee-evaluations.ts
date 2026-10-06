import { Router } from "express";
import { committeeEvaluationsController } from "../controllers/committee-evaluations-controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.js";

export const committeeEvaluationsRouter = Router();

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/committee-evaluation:
 *   post:
 *     summary: Atribui uma versão a um membro do comitê
 *     tags: [Committee evaluations]
 *     security:
 *       - bearerAuth: []
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
 *               responsible_member_user_id: { type: integer }
 *     responses:
 *       201: { description: Avaliação atribuída }
 *       400: { description: Payload ou membro responsável inválido }
 *       403: { description: Papel sem permissão }
 *       404: { description: Versão não encontrada }
 *       409: { description: Versão já atribuída }
 */
committeeEvaluationsRouter.post(
  "/:project_version_id/committee-evaluation",
  authenticate,
  restrictTo("admin", "committee"),
  committeeEvaluationsController.assign
);

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/committee-evaluation:
 *   put:
 *     summary: Registra o parecer final do comitê
 *     tags: [Committee evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: project_version_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [result]
 *             properties:
 *               result:
 *                 type: string
 *                 enum: [approved, needs_changes, rejected]
 *               justification: { type: string }
 *     responses:
 *       200: { description: Avaliação final registrada }
 *       400: { description: Resultado ou justificativa inválida }
 *       403: { description: Papel ou membro sem permissão }
 *       404: { description: Versão ou avaliação não encontrada }
 *       409: { description: Avaliação já finalizada }
 */
committeeEvaluationsRouter.put(
  "/:project_version_id/committee-evaluation",
  authenticate,
  restrictTo("admin", "committee"),
  committeeEvaluationsController.finalize
);

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/committee-evaluation:
 *   get:
 *     summary: Consulta a avaliação de uma versão
 *     tags: [Committee evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: project_version_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Avaliação encontrada }
 *       403: { description: Papel ou membro sem permissão }
 *       404: { description: Versão ou avaliação não encontrada }
 */
committeeEvaluationsRouter.get(
  "/:project_version_id/committee-evaluation",
  authenticate,
  restrictTo("admin", "committee"),
  committeeEvaluationsController.get
);
