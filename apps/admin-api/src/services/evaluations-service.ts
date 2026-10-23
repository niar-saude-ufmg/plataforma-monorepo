import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import { evaluationsRepository, type EvaluationDetails } from "../repositories/evaluations-repository.js";
import type { AssignEvaluationInput, UpdateEvaluationInput } from "../schemas/evaluation-schema.js";

const toResponse = (evaluation: EvaluationDetails) => ({
  id: evaluation.id,
  project_version: {
    id: evaluation.projectVersion.id,
    project_id: evaluation.projectVersion.projectId,
    version_number: evaluation.projectVersion.versionNumber,
    status: evaluation.projectVersion.status,
    submitted_at: evaluation.projectVersion.submittedAt?.toISOString() ?? null,
    created_at: evaluation.projectVersion.createdAt.toISOString()
  },
  project: {
    id: evaluation.projectVersion.project.id,
    owner_user_id: evaluation.projectVersion.project.ownerUserId,
    title: evaluation.projectVersion.project.title
  },
  assigned_to: evaluation.assignedTo
    ? {
        user_id: evaluation.assignedTo.id,
        full_name: evaluation.assignedTo.fullName,
        email: evaluation.assignedTo.email,
        role: evaluation.assignedTo.role
      }
    : null,
  assigned_by: evaluation.assignedBy
    ? {
        user_id: evaluation.assignedBy.id,
        full_name: evaluation.assignedBy.fullName,
        email: evaluation.assignedBy.email,
        role: evaluation.assignedBy.role
      }
    : null,
  evaluated_by: evaluation.evaluatedBy
    ? {
        user_id: evaluation.evaluatedBy.id,
        full_name: evaluation.evaluatedBy.fullName,
        email: evaluation.evaluatedBy.email,
        role: evaluation.evaluatedBy.role
      }
    : null,
  evaluation_context: evaluation.context,
  status: evaluation.status,
  justification: evaluation.justification,
  evaluated_at: evaluation.evaluatedAt?.toISOString() ?? null,
  created_at: evaluation.createdAt.toISOString(),
  updated_at: evaluation.updatedAt.toISOString()
});

const assertCanView = (evaluation: EvaluationDetails, currentUser: AuthenticatedUser) => {
  if (
    currentUser.role !== "admin" &&
    evaluation.assignedToUserId !== currentUser.id &&
    evaluation.assignedByUserId !== currentUser.id
  ) {
    throw new AppError("Usuário não autorizado para consultar esta avaliação", 403);
  }
};

export const evaluationsService = {
  assign: async (
    projectVersionId: number,
    data: AssignEvaluationInput,
    currentUser: AuthenticatedUser,
    ipAddress: string
  ) => {
    const assignedToUserId = data.assigned_to_user_id ??
      (currentUser.role === "auditor" || currentUser.role === "committee" ? currentUser.id : undefined);

    if (!assignedToUserId) {
      throw new AppError("assigned_to_user_id é obrigatório para admin", 400);
    }

    if (currentUser.role !== "admin" && assignedToUserId !== currentUser.id) {
      throw new AppError("O usuário só pode assumir a própria avaliação", 403);
    }

    return toResponse(await evaluationsRepository.createAssignment({
      projectVersionId,
      assignedToUserId,
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      ipAddress
    }));
  },

  get: async (projectVersionId: number, currentUser: AuthenticatedUser) => {
    const evaluation = await evaluationsRepository.findByProjectVersionId(projectVersionId);
    assertCanView(evaluation, currentUser);
    return toResponse(evaluation);
  },

  update: async (
    projectVersionId: number,
    data: UpdateEvaluationInput,
    currentUser: AuthenticatedUser,
    ipAddress: string
  ) => {
    const existing = await evaluationsRepository.findByProjectVersionId(projectVersionId);
    if (
      (currentUser.role !== "auditor" && currentUser.role !== "committee") ||
      existing.assignedToUserId !== currentUser.id
    ) {
      throw new AppError("Usuário não autorizado para atualizar esta avaliação", 403);
    }

    return toResponse(await evaluationsRepository.update({
      projectVersionId,
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      status: data.status,
      committeeMemberUserId: data.committee_member_user_id,
      justification: data.justification?.trim() ?? "",
      ipAddress
    }));
  }
};
