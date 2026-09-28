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
 *     responses:
 *       200: { description: Lista JSON direta de projetos }
 *       401: { description: Não autenticado }
 *       403: { description: Filtro fora do escopo do pesquisador }
 */
projectsRouter.get("/", authenticate, restrictTo("researcher", "admin", "committee"), projectsController.list);

/**
 * @swagger
 * /admin/projects/{projectId}:
 *   get:
 *     summary: Obtém um projeto visível para o usuário autenticado
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 */
projectsRouter.get("/:projectId", authenticate, restrictTo("researcher", "admin", "committee"), projectsController.detail);

/**
 * @swagger
 * /admin/projects/{projectId}/documents/{documentId}/download:
 *   get:
 *     summary: Baixa um documento após validar projeto, perfil e tipo
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 */
projectsRouter.get(
  "/:projectId/documents/:documentId/download",
  authenticate,
  restrictTo("researcher", "admin", "committee"),
  projectsController.download
);
