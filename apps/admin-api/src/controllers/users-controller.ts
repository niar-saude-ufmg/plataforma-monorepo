import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import {
  listUsersQuerySchema,
  createAdministratorSchema,
  createCommitteeMemberSchema,
  createResearcherSchema
} from "../schemas/user-schema.js";
import { usersService } from "../services/users-service.js";

const parseMultipartJsonField = (value: unknown, fieldName: string) => {
  if (typeof value !== "string") {
    throw new AppError(`O campo ${fieldName} deve conter um JSON válido`, 400);
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    throw new AppError(`O campo ${fieldName} deve conter um JSON válido`, 400);
  }
};

const parseResearcherMultipartRequest = (request: Request) => {
  if (!request.file) {
    throw new AppError("O documento do COEP é obrigatório", 400);
  }

  const profile = parseMultipartJsonField(request.body.profile, "profile");
  const researcherProfile = parseMultipartJsonField(
    request.body.researcher_profile,
    "researcher_profile"
  );
  const coep = parseMultipartJsonField(request.body.coep, "coep");

  return createResearcherSchema.parse({
    full_name: request.body.full_name,
    email: request.body.email,
    password: request.body.password,
    profile,
    researcher_profile: researcherProfile,
    coep: {
      ...coep,
      document_filename: request.file.originalname
    }
  });
};

export const usersController = {
  list: async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!request.user) {
        throw new AppError("Não autenticado", 401);
      }

      const query = listUsersQuerySchema.parse(request.query);
      const users = await usersService.listUsers(query, request.user);
      response.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },

  create: async (request: Request, response: Response, next: NextFunction) => {
    try {
      const data = parseResearcherMultipartRequest(request);
      const user = await usersService.createUser(data, request.file!);
      response.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  createResearcher: async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!request.user) {
        throw new AppError("Não autenticado", 401);
      }
      const data = parseResearcherMultipartRequest(request);
      const user = await usersService.createResearcher(data, request.file!, request.user.id);
      response.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  createCommitteeMember: async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!request.user) {
        throw new AppError("Não autenticado", 401);
      }
      const data = createCommitteeMemberSchema.parse(request.body);
      const user = await usersService.createCommitteeMember(data, request.user!.id);
      response.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  createAdministrator: async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!request.user) {
        throw new AppError("Não autenticado", 401);
      }
      const data = createAdministratorSchema.parse(request.body);
      const user = await usersService.createAdministrator(data, request.user!.id);
      response.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
};
