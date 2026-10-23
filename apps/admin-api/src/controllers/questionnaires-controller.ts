import { NextFunction, Request, Response } from "express";
import {
  listQuestionnairesQuerySchema,
  createQuestionnaireSchema,
  updateQuestionnaireSchema,
  questionnaireIdParamSchema
} from "../schemas/questionnaire-schema.js";
import { questionnairesService } from "../services/questionnaires-service.js";

export const questionnairesController = {
  list: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const query = listQuestionnairesQuerySchema.parse(request.query);
      response.status(200).json(await questionnairesService.listQuestionnaires(query));
    } catch (error) {
      next(error);
    }
  },

  get: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { id } = questionnaireIdParamSchema.parse(request.params);
      response.status(200).json(await questionnairesService.getQuestionnaire(id));
    } catch (error) {
      next(error);
    }
  },

  create: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const definition = createQuestionnaireSchema.parse(request.body);
      response.status(201).json(await questionnairesService.createQuestionnaire(definition));
    } catch (error) {
      next(error);
    }
  },

  update: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { id } = questionnaireIdParamSchema.parse(request.params);
      const input = updateQuestionnaireSchema.parse(request.body);
      response.status(200).json(await questionnairesService.updateQuestionnaire(id, input));
    } catch (error) {
      next(error);
    }
  },

  publish: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { id } = questionnaireIdParamSchema.parse(request.params);
      response.status(200).json(await questionnairesService.publishQuestionnaire(id));
    } catch (error) {
      next(error);
    }
  }
};
