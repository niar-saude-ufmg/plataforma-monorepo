import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import {
  auditorEvaluationsRepository,
  type AuditorEvaluationDetails
} from "../repositories/auditor-evaluations-repository.js";
import type {
  AssignAuditorEvaluationInput,
  UpdateAuditorEvaluationInput
} from "../schemas/auditor-evaluation-schema.js";

const toResponse = (evaluation: AuditorEvaluationDetails) => ({
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
  assigned_by_user_id: evaluation.assignedByUserId,
  evaluated_by_user_id: evaluation.evaluatedByUserId,
  evaluation_context: evaluation.context,
  status: evaluation.status,
  justification: evaluation.justification,
  evaluated_at: evaluation.evaluatedAt?.toISOString() ?? null,
  created_at: evaluation.createdAt.toISOString(),
  updated_at: evaluation.updatedAt.toISOString()
});

export const auditorEvaluationsService = {
  assign: async (
    projectVersionId: number,
    data: AssignAuditorEvaluationInput,
    currentUser: AuthenticatedUser,
    ipAddress: string
  ) => {
    const assignedToUserId = data.assigned_to_user_id ?? (currentUser.role === "auditor" ? currentUser.id : undefined);

    if (!assignedToUserId) {
      throw new AppError("assigned_to_user_id é obrigatório para admin ou pesquisador", 400);
    }

    if (currentUser.role === "auditor" && assignedToUserId !== currentUser.id) {
      throw new AppError("Auditor só pode assumir a própria avaliação", 403);
    }

    return toResponse(await auditorEvaluationsRepository.createAssignment({
      projectVersionId,
      assignedToUserId,
      actorUserId: currentUser.id,
      ipAddress
    }));
  },

  update: async (
    projectVersionId: number,
    data: UpdateAuditorEvaluationInput,
    currentUser: AuthenticatedUser,
    ipAddress: string
  ) => {
    const existing = await auditorEvaluationsRepository.findByProjectVersionId(projectVersionId);

    if (
      (currentUser.role !== "auditor" && currentUser.role !== "committee") ||
      existing.assignedToUserId !== currentUser.id
    ) {
      throw new AppError("Usuário não autorizado para atualizar esta avaliação", 403);
    }

    return toResponse(await auditorEvaluationsRepository.update({
      projectVersionId,
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      status: data.status,
      committeeMemberUserId: data.committee_member_user_id,
      justification: data.justification?.trim() ?? "",
      ipAddress
    }));
  },
};
