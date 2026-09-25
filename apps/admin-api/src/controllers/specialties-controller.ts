import { NextFunction, Request, Response } from "express";
import {
  createSpecialtySchema,
  listSpecialtiesQuerySchema,
  specialtyIdParamSchema,
  updateSpecialtySchema,
  updateSpecialtyStatusSchema
} from "../schemas/specialty-schema.js";
import { specialtiesService } from "../services/specialties-service.js";

export const specialtiesController = {
  list: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const query = listSpecialtiesQuerySchema.parse(request.query);
      const specialties = await specialtiesService.listSpecialties(query);
      response.status(200).json(specialties);
    } catch (error) {
      next(error);
    }
  },

  create: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const data = createSpecialtySchema.parse(request.body);
      const specialty = await specialtiesService.createSpecialty(data);
      response.status(201).json(specialty);
    } catch (error) {
      next(error);
    }
  },

  update: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { id } = specialtyIdParamSchema.parse(request.params);
      const data = updateSpecialtySchema.parse(request.body);
      const specialty = await specialtiesService.updateSpecialty(id, data);
      response.status(200).json(specialty);
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { id } = specialtyIdParamSchema.parse(request.params);
      const data = updateSpecialtyStatusSchema.parse(request.body);
      const specialty = await specialtiesService.updateStatus(id, data.is_active);
      response.status(200).json(specialty);
    } catch (error) {
      next(error);
    }
  }
};
