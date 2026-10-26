import { NextFunction, Request, Response } from "express";
import {
  assignEvaluationSchema,
  projectVersionIdParamSchema,
  updateEvaluationSchema
} from "../schemas/evaluation-schema.js";
import { evaluationsService } from "../services/evaluations-service.js";

export const evaluationsController = {
  assign: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { project_version_id } = projectVersionIdParamSchema.parse(request.params);
      const data = assignEvaluationSchema.parse(request.body);
      const evaluation = await evaluationsService.assign(project_version_id, data, request.user!, request.ip ?? "");
      response.status(201).json(evaluation);
    } catch (error) {
      next(error);
    }
  },

  get: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { project_version_id } = projectVersionIdParamSchema.parse(request.params);
      const evaluation = await evaluationsService.get(project_version_id, request.user!);
      response.status(200).json(evaluation);
    } catch (error) {
      next(error);
    }
  },

  update: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { project_version_id } = projectVersionIdParamSchema.parse(request.params);
      const data = updateEvaluationSchema.parse(request.body);
      const evaluation = await evaluationsService.update(project_version_id, data, request.user!, request.ip ?? "");
      response.status(200).json(evaluation);
    } catch (error) {
      next(error);
    }
  }
};
