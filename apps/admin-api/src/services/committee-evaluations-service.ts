import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import {
  committeeEvaluationsRepository,
  type CommitteeEvaluationDetails
} from "../repositories/committee-evaluations-repository.js";
import type {
  AssignCommitteeEvaluationInput,
  CommitteeEvaluationResponse,
  FinalizeCommitteeEvaluationInput
} from "../schemas/committee-evaluation-schema.js";

const APPROVED_DEFAULT_JUSTIFICATION = "Aprovado pelo comitê.";

const toResponse = (evaluation: CommitteeEvaluationDetails): CommitteeEvaluationResponse => ({
  id: evaluation.id,
  project_version: {
    id: evaluation.projectVersion.id,
    project_id: evaluation.projectVersion.projectId,
    version_number: evaluation.projectVersion.versionNumber,
    status: evaluation.projectVersion.status,
    user_coep_data_id: evaluation.projectVersion.userCoepDataId,
    submitted_at: evaluation.projectVersion.submittedAt?.toISOString() ?? null,
    created_at: evaluation.projectVersion.createdAt.toISOString()
  },
  project: {
    id: evaluation.projectVersion.project.id,
    owner_user_id: evaluation.projectVersion.project.ownerUserId,
    title: evaluation.projectVersion.project.title
  },
  responsible_member: {
    user_id: evaluation.responsibleMember.userId,
    full_name: evaluation.responsibleMember.user.fullName,
    email: evaluation.responsibleMember.user.email,
    specialty: {
      id: evaluation.responsibleMember.specialty.id,
      code: evaluation.responsibleMember.specialty.code,
      name: evaluation.responsibleMember.specialty.name
    }
  },
  result: evaluation.result,
  justification: evaluation.justification,
  evaluated_at: evaluation.evaluatedAt?.toISOString() ?? null,
  created_at: evaluation.createdAt.toISOString(),
  updated_at: evaluation.updatedAt.toISOString()
});

export const committeeEvaluationsService = {
  assign: async (
    projectVersionId: number,
    data: AssignCommitteeEvaluationInput,
    currentUser: AuthenticatedUser,
    ipAddress: string
  ): Promise<CommitteeEvaluationResponse> => {
    let responsibleMemberUserId: number;

    if (currentUser.role === "admin") {
      if (!data.responsible_member_user_id) {
        throw new AppError("responsible_member_user_id é obrigatório para admin", 400);
      }
      responsibleMemberUserId = data.responsible_member_user_id;
    } else {
      if (data.responsible_member_user_id !== undefined) {
        throw new AppError("Membros do comitê devem assumir a própria avaliação", 400);
      }
      responsibleMemberUserId = currentUser.id;
    }

    const evaluation = await committeeEvaluationsRepository.createAssignment({
      projectVersionId,
      responsibleMemberUserId,
      actorUserId: currentUser.id,
      ipAddress
    });

    return toResponse(evaluation);
  },

  finalize: async (
    projectVersionId: number,
    data: FinalizeCommitteeEvaluationInput,
    currentUser: AuthenticatedUser,
    ipAddress: string
  ): Promise<CommitteeEvaluationResponse> => {
    const trimmedJustification = data.justification?.trim();
    if ((data.result === "needs_changes" || data.result === "rejected") && !trimmedJustification) {
      throw new AppError("Justificativa é obrigatória para este resultado", 400);
    }

    const justification = trimmedJustification || APPROVED_DEFAULT_JUSTIFICATION;
    const evaluation = await committeeEvaluationsRepository.finalize({
      projectVersionId,
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      ipAddress,
      result: data.result,
      justification
    });

    return toResponse(evaluation);
  },

  get: async (projectVersionId: number, currentUser: AuthenticatedUser): Promise<CommitteeEvaluationResponse> => {
    const evaluation = await committeeEvaluationsRepository.findByProjectVersionId(projectVersionId);
    if (currentUser.role === "committee" && evaluation.responsibleMemberUserId !== currentUser.id) {
      throw new AppError("A avaliação está atribuída a outro membro do comitê", 403);
    }
    return toResponse(evaluation);
  }
};
