import { Router } from "express";
import { projectsController } from "../controllers/projects-controller.js";
import { authenticate, restrictTo } from "../middlewares/auth.js";

export const projectsRouter = Router();

/**
 * @swagger
 * /admin/projects:
 *   get:
 *     summary: Lista projetos visíveis para o usuário autenticado
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: page_size
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted_for_review, submitted_to_committee, approved_to_schedule, rejected_to_safe_room, resubmitted_for_review, resubmitted_to_committee, under_review, scheduled_for_safe_room, approved_for_safe_room, under_safe_room, report_submitted, report_under_review, safe_room_reuse_requested, rescheduled_for_safe_room, reapproved_for_safe_room, report_resubmitted, needs_changes, approved, rejected]
 *       - in: query
 *         name: evaluation_status
 *         description: Estado derivado da avaliação da versão mais recente. waiting significa que ainda não existe avaliação atribuída.
 *         schema:
 *           type: string
 *           enum: [waiting, to_review, sent_to_committee, approved_by_committee, rejected_by_committee, needs_changes_by_committee, approved, needs_changes, rejected]
 *       - in: query
 *         name: evaluation_context
 *         description: Etapa do fluxo à qual pertence a avaliação mais recente.
 *         schema:
 *           type: string
 *           enum: [pre_safe_room, post_safe_room]
 *       - in: query
 *         name: submitted_from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: submitted_to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: updated_from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: updated_to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: researcher_id
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: version_number
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: document_type
 *         schema: { type: string, maxLength: 100 }
 *       - in: query
 *         name: has_document
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string, maxLength: 255 }
 *       - in: query
 *         name: order_by
 *         schema: { type: string, enum: [updated_at, submitted_at, title, id], default: updated_at }
 *       - in: query
 *         name: order_direction
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Lista JSON direta de projetos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [items, pagination]
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/ProjectResponse' }
 *                 pagination:
 *                   type: object
 *                   required: [page, page_size, total_items, total_pages]
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     page_size: { type: integer, example: 20 }
 *                     total_items: { type: integer, example: 24 }
 *                     total_pages: { type: integer, example: 2 }
 *       401: { description: Não autenticado }
 *       403: { description: Filtro fora do escopo do pesquisador }
 *       422: { description: Filtros inválidos }
 */
projectsRouter.get("/", authenticate, restrictTo("researcher", "admin", "committee", "auditor"), projectsController.list);

/**
 * @swagger
 * /admin/projects/{projectId}:
 *   get:
 *     summary: Obtém um projeto visível para o usuário autenticado
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Projeto com histórico de status e documentos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProjectResponse' }
 *       401: { description: Não autenticado }
 *       404: { description: Projeto não encontrado }
 */
projectsRouter.get("/:projectId", authenticate, restrictTo("researcher", "admin", "committee", "auditor"), projectsController.detail);

/**
 * @swagger
 * /admin/projects/{projectId}/documents/{documentId}/download:
 *   get:
 *     summary: Baixa um documento após validar projeto, perfil e tipo
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Arquivo do documento
 *         content:
 *           application/octet-stream:
 *             schema: { type: string, format: binary }
 *       401: { description: Não autenticado }
 *       403: { description: Documento fora do escopo do perfil }
 *       404: { description: Documento ou arquivo não encontrado }
 */
projectsRouter.get(
  "/:projectId/documents/:documentId/download",
  authenticate,
  restrictTo("researcher", "admin", "committee", "auditor"),
  projectsController.download
);
