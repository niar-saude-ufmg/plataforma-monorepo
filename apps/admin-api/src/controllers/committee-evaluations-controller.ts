import { NextFunction, Request, Response } from "express";
import {
  assignCommitteeEvaluationSchema,
  finalizeCommitteeEvaluationSchema,
  projectVersionIdParamSchema
} from "../schemas/committee-evaluation-schema.js";
import { committeeEvaluationsService } from "../services/committee-evaluations-service.js";

export const committeeEvaluationsController = {
  assign: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { project_version_id } = projectVersionIdParamSchema.parse(request.params);
      const data = assignCommitteeEvaluationSchema.parse(request.body);
      const evaluation = await committeeEvaluationsService.assign(
        project_version_id,
        data,
        request.user!,
        request.ip ?? ""
      );
      response.status(201).json(evaluation);
    } catch (error) {
      next(error);
    }
  },

  finalize: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { project_version_id } = projectVersionIdParamSchema.parse(request.params);
      const data = finalizeCommitteeEvaluationSchema.parse(request.body);
      const evaluation = await committeeEvaluationsService.finalize(
        project_version_id,
        data,
        request.user!,
        request.ip ?? ""
      );
      response.status(200).json(evaluation);
    } catch (error) {
      next(error);
    }
  },

  get: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { project_version_id } = projectVersionIdParamSchema.parse(request.params);
      const evaluation = await committeeEvaluationsService.get(project_version_id, request.user!);
      response.status(200).json(evaluation);
    } catch (error) {
      next(error);
    }
  }
};
