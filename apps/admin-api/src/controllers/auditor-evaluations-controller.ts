import { NextFunction, Request, Response } from "express";
import {
  assignAuditorEvaluationSchema,
  projectVersionIdParamSchema,
  updateAuditorEvaluationSchema
} from "../schemas/auditor-evaluation-schema.js";
import { auditorEvaluationsService } from "../services/auditor-evaluations-service.js";

export const auditorEvaluationsController = {
  assign: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { project_version_id } = projectVersionIdParamSchema.parse(request.params);
      const data = assignAuditorEvaluationSchema.parse(request.body);
      const evaluation = await auditorEvaluationsService.assign(project_version_id, data, request.user!, request.ip ?? "");
      response.status(201).json(evaluation);
    } catch (error) {
      next(error);
    }
  },

  update: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { project_version_id } = projectVersionIdParamSchema.parse(request.params);
      const data = updateAuditorEvaluationSchema.parse(request.body);
      const evaluation = await auditorEvaluationsService.update(project_version_id, data, request.user!, request.ip ?? "");
      response.status(200).json(evaluation);
    } catch (error) {
      next(error);
    }
  },
};
