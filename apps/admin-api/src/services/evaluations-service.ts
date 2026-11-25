import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import { evaluationsRepository, type EvaluationDetails } from "../repositories/evaluations-repository.js";
import type { AssignEvaluationInput, UpdateEvaluationInput } from "../schemas/evaluation-schema.js";

const toUser = (user: { id: number; fullName: string; email: string; role: string } | null) =>
  user ? { user_id: user.id, full_name: user.fullName, email: user.email, role: user.role } : null;

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
  assigned_to: toUser(evaluation.assignedTo),
  assigned_by: toUser(evaluation.assignedBy),
  evaluated_by: toUser(evaluation.evaluatedBy),
  status: evaluation.status,
  justification: evaluation.justification,
  certification_decision: evaluation.certificationDecision,
  certification_reason: evaluation.certificationReason,
  evaluated_at: evaluation.evaluatedAt?.toISOString() ?? null,
  created_at: evaluation.createdAt.toISOString(),
  updated_at: evaluation.updatedAt.toISOString()
});

export const evaluationsService = {
  assign: async (projectVersionId: number, data: AssignEvaluationInput, currentUser: AuthenticatedUser, ipAddress: string) => {
    const assignedToUserId = data.assigned_to_user_id ?? (currentUser.role === "committee" ? currentUser.id : undefined);
    if (!assignedToUserId) throw new AppError("assigned_to_user_id é obrigatório para admin", 400);
    if (currentUser.role !== "admin" && currentUser.role !== "committee") {
      throw new AppError("Usuário não autorizado para atribuir projeto", 403);
    }
    return toResponse(await evaluationsRepository.assign({ projectVersionId, assignedToUserId, actorUserId: currentUser.id, actorRole: currentUser.role, ipAddress }));
  },
  get: async (projectVersionId: number, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== "admin" && currentUser.role !== "committee") {
      throw new AppError("Usuário não autorizado para consultar avaliação", 403);
    }
    return toResponse(await evaluationsRepository.findByProjectVersionId(projectVersionId));
  },
  update: async (projectVersionId: number, data: UpdateEvaluationInput, currentUser: AuthenticatedUser, ipAddress: string) => {
    if (currentUser.role !== "committee") throw new AppError("Somente o comitê pode registrar parecer", 403);
    return toResponse(await evaluationsRepository.decide({
      projectVersionId,
      actorUserId: currentUser.id,
      status: data.status,
      justification: data.justification?.trim() ?? "",
      certificationDecision: data.certification_decision,
      certificationReason: data.certification_reason?.trim(),
      ipAddress
    }));
  }
};
