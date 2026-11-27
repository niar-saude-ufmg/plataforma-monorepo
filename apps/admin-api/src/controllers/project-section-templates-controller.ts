import { NextFunction, Request, Response } from "express";
import {
  listProjectSectionTemplatesQuerySchema,
  createProjectSectionTemplateSchema,
  updateProjectSectionTemplateSchema,
  projectSectionTemplateIdParamSchema
} from "../schemas/project-section-templates-schema.js";
import { projectSectionTemplatesService } from "../services/project-section-templates-service.js";

export const projectSectionTemplatesController = {
  list: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const query = listProjectSectionTemplatesQuerySchema.parse(request.query);
      response.status(200).json(await projectSectionTemplatesService.listProjectSectionTemplates(query));
    } catch (error) {
      next(error);
    }
  },

  get: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { id } = projectSectionTemplateIdParamSchema.parse(request.params);
      response.status(200).json(await projectSectionTemplatesService.getProjectSectionTemplate(id));
    } catch (error) {
      next(error);
    }
  },

  create: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const definition = createProjectSectionTemplateSchema.parse(request.body);
      response.status(201).json(await projectSectionTemplatesService.createProjectSectionTemplate(definition));
    } catch (error) {
      next(error);
    }
  },

  update: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { id } = projectSectionTemplateIdParamSchema.parse(request.params);
      const input = updateProjectSectionTemplateSchema.parse(request.body);
      response.status(200).json(await projectSectionTemplatesService.updateProjectSectionTemplate(id, input));
    } catch (error) {
      next(error);
    }
  },

  publish: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { id } = projectSectionTemplateIdParamSchema.parse(request.params);
      response.status(200).json(await projectSectionTemplatesService.publishProjectSectionTemplate(id));
    } catch (error) {
      next(error);
    }
  }
}
