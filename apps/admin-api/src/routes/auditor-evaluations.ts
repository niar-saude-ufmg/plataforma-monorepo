import { Router } from "express";
import { auditorEvaluationsController } from "../controllers/auditor-evaluations-controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.js";

export const auditorEvaluationsRouter = Router();

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/auditor-evaluation:
 *   post:
 *     summary: Atribui uma versão a um auditor ou permite que o auditor a assuma
 *     tags: [Auditor evaluations]
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
 *       400: { description: Payload ou auditor inválido }
 *       403: { description: Papel sem permissão }
 *       409: { description: Versão já atribuída }
 */
auditorEvaluationsRouter.post(
  "/:project_version_id/auditor-evaluation",
  authenticate,
  restrictTo("researcher", "admin", "auditor"),
  auditorEvaluationsController.assign
);

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/auditor-evaluation:
 *   put:
 *     summary: Atualiza a decisão ou encaminha a avaliação ao comitê
 *     tags: [Auditor evaluations]
 *     security: [{ bearerAuth: [] }]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [sent_to_committee, approved, rejected, needs_changes, approved_by_committee, rejected_by_committee, needs_changes_by_committee]
 *               committee_member_user_id: { type: integer }
 *               justification: { type: string }
 *     responses:
 *       200: { description: Avaliação atualizada }
 *       400: { description: Payload ou transição inválida }
 *       403: { description: Auditor diferente do responsável }
 *       409: { description: Transição concorrente ou inválida }
 */
auditorEvaluationsRouter.put(
  "/:project_version_id/auditor-evaluation",
  authenticate,
  restrictTo("auditor", "committee"),
  auditorEvaluationsController.update
);
