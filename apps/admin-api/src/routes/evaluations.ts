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
 *       201:
 *         description: Avaliação atribuída
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EvaluationResponse' }
 *       400: { description: Payload ou responsável inválido }
 *       403: { description: Papel sem permissão }
 *       409: { description: Versão já atribuída }
 */
evaluationsRouter.post(
  "/:project_version_id/evaluation",
  authenticate,
  restrictTo("admin", "committee"),
  evaluationsController.assign
);

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/evaluation:
 *   get:
 *     summary: Consulta a rodada de avaliação mais recente da versão
 *     parameters:
 *       - in: path
 *         name: project_version_id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Parecer e referência à versão e entrega avaliada; histórico disponível no projeto
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EvaluationResponse' }
 *       403: { description: Sem permissão de consulta }
 *       404: { description: Avaliação não encontrada }
 *     tags: [Evaluations]
 *     security: [{ bearerAuth: [] }]
 */
evaluationsRouter.get(
  "/:project_version_id/evaluation",
  authenticate,
  restrictTo("admin", "committee"),
  evaluationsController.get
);

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/evaluation:
 *   put:
 *     summary: Registra uma decisão preservando todos os pareceres anteriores
 *     description: to_review é criado somente pela atribuição ou recebimento. project_changes_requested abre revisão do projeto; report_changes_requested solicita ajustes na mesma versão. certification_decision é obrigatório em report_approved; not_granted exige certification_reason. evaluation_id é obrigatório para decisões de relatório e protege contra formulário desatualizado.
 *     parameters:
 *       - in: path
 *         name: project_version_id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateEvaluationInput' }
 *     responses:
 *       200:
 *         description: Parecer da rodada com referência à entrega
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EvaluationResponse' }
 *       403: { description: Avaliação atribuída a outro membro ou decisão incompatível com o papel }
 *       404: { description: Avaliação ou versão não encontrada }
 *       409: { description: Versão antiga, rodada concluída ou formulário desatualizado }
 *       400: { description: Payload inválido, inclusive status to_review, justificativa ausente ou certificação fora da aprovação }
 *     tags: [Evaluations]
 *     security: [{ bearerAuth: [] }]
 */
evaluationsRouter.put(
  "/:project_version_id/evaluation",
  authenticate,
  restrictTo("committee"),
  evaluationsController.update
);

/**
 * @swagger
 * /admin/project-versions/{project_version_id}/report-deliveries:
 *   post:
 *     summary: Recebe uma entrega pós-sala segura na mesma versão e mantém o responsável do Comitê
 *     description: Contrato local para artefatos já persistidos em export_artifacts. Integração externa futura. Cada arquivo deve ser novo e pertencer à sessão do projeto ou sua engenharia de dados. Tipos aceitos são report, report_artifact e filled_questionnaire. Questionários preenchidos exigem questionnaire_id no artefato, apontando à definição publicada exata. O campo opcional no payload deve corresponder a essa referência.
 *     tags: [Evaluations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: project_version_id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [delivery_number, documents]
 *             properties:
 *               delivery_number: { type: integer, minimum: 1, description: Número seguinte da entrega; duplicatas recebem 409 }
 *               documents:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   required: [source_export_artifact_id]
 *                   properties:
 *                     source_export_artifact_id: { type: integer, minimum: 1 }
 *                     questionnaire_id: { type: integer, minimum: 1 }
 *     responses:
 *       201:
 *         description: Entrega preservada e rodada de avaliação aberta automaticamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project_version_id: { type: integer }
 *                 delivery_number: { type: integer }
 *       400: { description: Artefatos ou definição de questionário inválidos }
 *       403: { description: Apenas gestor ou pesquisador proprietário }
 *       404: { description: Versão não encontrada }
 *       409: { description: Versão antiga, entrega duplicada, estado inválido ou ausência do responsável do Comitê }
 */
evaluationsRouter.post(
  "/:project_version_id/report-deliveries",
  authenticate,
  restrictTo("admin", "researcher"),
  evaluationsController.receiveReport
);
