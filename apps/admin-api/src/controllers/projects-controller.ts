import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { listProjectsQuerySchema, projectDocumentParamsSchema, projectParamsSchema } from "../schemas/project-schema.js";
import { projectsService } from "../services/projects-service.js";

const authenticatedUser = (request: Request) => {
  if (!request.user) throw new AppError("Não autenticado", 401);
  return request.user;
};

export const projectsController = {
  list: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const query = listProjectsQuerySchema.parse(request.query);
      const projects = await projectsService.listProjects(query, authenticatedUser(request));
      response.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  },

  detail: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { projectId } = projectParamsSchema.parse(request.params);
      const project = await projectsService.getProject(projectId, authenticatedUser(request));
      response.status(200).json(project);
    } catch (error) {
      next(error);
    }
  },

  download: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { projectId, documentId } = projectDocumentParamsSchema.parse(request.params);
      const download = await projectsService.getDocumentDownload(projectId, documentId, authenticatedUser(request));
      response.download(download.filePath, download.filename, (error) => {
        if (error) next(error);
      });
    } catch (error) {
      next(error);
    }
  }
};
