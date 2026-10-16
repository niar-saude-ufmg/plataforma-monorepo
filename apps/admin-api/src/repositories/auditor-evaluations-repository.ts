import { Prisma, prisma } from "@niar/database";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";

const evaluationDetailsSelect = {
  id: true,
  projectVersionId: true,
  assignedToUserId: true,
  assignedByUserId: true,
  evaluatedByUserId: true,
  context: true,
  status: true,
  justification: true,
  evaluatedAt: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: { select: { id: true, fullName: true, email: true, role: true } },
  projectVersion: {
    select: {
      id: true,
      projectId: true,
      versionNumber: true,
      status: true,
      submittedAt: true,
      createdAt: true,
      project: { select: { id: true, ownerUserId: true, title: true } }
    }
  }
} satisfies Prisma.EvaluationSelect;

export type AuditorEvaluationDetails = Prisma.EvaluationGetPayload<{
  select: typeof evaluationDetailsSelect;
}>;

type AssignmentData = {
  projectVersionId: number;
  assignedToUserId: number;
  actorUserId: number;
  ipAddress: string;
};

type UpdateData = {
  projectVersionId: number;
  actorUserId: number;
  actorRole: UserRole;
  status:
    | "sent_to_committee"
    | "approved"
    | "rejected"
    | "needs_changes"
    | "approved_by_committee"
    | "rejected_by_committee"
    | "needs_changes_by_committee";
  committeeMemberUserId?: number;
  justification: string;
  ipAddress: string;
};

const loadEvaluation = (client: Prisma.TransactionClient, projectVersionId: number) =>
  client.evaluation.findFirstOrThrow({
    where: { projectVersionId },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: evaluationDetailsSelect
  });

const isCommitteeReviewStatus = (status: string) =>
  status === "approved_by_committee" ||
  status === "rejected_by_committee" ||
  status === "needs_changes_by_committee";

const isAuditorStatus = (status: UpdateData["status"]) =>
  status === "sent_to_committee" ||
  status === "approved" ||
  status === "rejected" ||
  status === "needs_changes";

const isCommitteeStatus = (status: UpdateData["status"]) =>
  status === "approved_by_committee" ||
  status === "rejected_by_committee" ||
  status === "needs_changes_by_committee";

const projectStatusFor = (status: UpdateData["status"]) => {
  if (status === "approved") return "approved_to_schedule" as const;
  if (status === "needs_changes") return "needs_changes" as const;
  if (status === "rejected") return "rejected" as const;
  return "under_review" as const;
};

const assertJustification = (status: UpdateData["status"], justification: string) => {
  if (
    (status === "needs_changes" ||
      status === "rejected" ||
      status === "needs_changes_by_committee" ||
      status === "rejected_by_committee") &&
    !justification
  ) {
    throw new AppError("Justificativa é obrigatória para este encaminhamento", 400);
  }
};

export const auditorEvaluationsRepository = {
  findByProjectVersionId: async (projectVersionId: number): Promise<AuditorEvaluationDetails> => {
    const evaluation = await prisma.evaluation.findFirst({
      where: { projectVersionId },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      select: evaluationDetailsSelect
    });

    if (!evaluation) throw new AppError("Avaliação do auditor não encontrada", 404);
    return evaluation;
  },

  createAssignment: async (data: AssignmentData): Promise<AuditorEvaluationDetails> =>
    prisma.$transaction(async (transaction) => {
      const version = await transaction.projectVersion.findUnique({
        where: { id: data.projectVersionId },
        select: { id: true, status: true }
      });

      if (!version) throw new AppError("Versão do projeto não encontrada", 404);

      const auditor = await transaction.user.findUnique({
        where: { id: data.assignedToUserId },
        select: { role: true, accountStatus: true }
      });

      if (auditor?.role !== "auditor" || auditor.accountStatus !== "active") {
        throw new AppError("Usuário responsável precisa ser um auditor ativo", 400);
      }

      const postSafeRoomStatuses = new Set([
        "report_submitted",
        "report_under_review",
        "safe_room_reuse_requested",
        "rescheduled_for_safe_room",
        "reapproved_for_safe_room",
        "report_resubmitted"
      ]);
      const context = postSafeRoomStatuses.has(version.status) ? "post_safe_room" : "pre_safe_room";

      const evaluation = await transaction.evaluation.create({
        data: {
          projectVersionId: data.projectVersionId,
          assignedToUserId: data.assignedToUserId,
          assignedByUserId: data.actorUserId,
          context,
          status: "to_review"
        },
        select: { id: true }
      });

      await transaction.projectVersion.update({
        where: { id: data.projectVersionId },
        data: { status: "under_review" }
      });

      await transaction.projectStatusHistory.create({
        data: {
          projectVersionId: data.projectVersionId,
          status: "under_review",
          notes: "Projeto atribuído para avaliação do auditor.",
          actorUserId: data.actorUserId,
          evaluationId: evaluation.id
        }
      });

      await transaction.auditLog.create({
        data: {
          userId: data.actorUserId,
          action: "assign_auditor_evaluation",
          resourceType: "evaluation",
          resourceId: String(evaluation.id),
          details: JSON.stringify({
            project_version_id: data.projectVersionId,
            assigned_to_user_id: data.assignedToUserId,
            status: "to_review"
          }),
          ipAddress: data.ipAddress
        }
      });

      return loadEvaluation(transaction, data.projectVersionId);
    }),

  update: async (data: UpdateData): Promise<AuditorEvaluationDetails> => {
    assertJustification(data.status, data.justification);

    return prisma.$transaction(async (transaction) => {
      const evaluation = await transaction.evaluation.findFirst({
        where: { projectVersionId: data.projectVersionId },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        select: { id: true, status: true, assignedToUserId: true, assignedByUserId: true }
      });

      if (!evaluation) throw new AppError("Avaliação do auditor não encontrada", 404);

      if (
        (data.actorRole === "auditor" || data.actorRole === "committee") &&
        evaluation.assignedToUserId !== data.actorUserId
      ) {
        throw new AppError("A avaliação está atribuída a outro usuário", 403);
      }

      if (data.actorRole === "auditor") {
        if (!isAuditorStatus(data.status)) {
          throw new AppError("Auditor não pode usar um status exclusivo do comitê", 403);
        }

        if (data.status === "sent_to_committee" && evaluation.status !== "to_review") {
          throw new AppError("Somente uma avaliação aguardando o auditor pode ser enviada ao comitê", 409);
        }

        const canAuditorDecide = evaluation.status === "to_review" || isCommitteeReviewStatus(evaluation.status);
        if (data.status !== "sent_to_committee" && !canAuditorDecide) {
          throw new AppError("A avaliação não está disponível para decisão do auditor", 409);
        }
      }

      if (data.actorRole === "committee") {
        if (!isCommitteeStatus(data.status)) {
          throw new AppError("Comitê só pode usar status terminados em _by_committee", 403);
        }

        if (evaluation.status !== "sent_to_committee") {
          throw new AppError("A avaliação não está aguardando decisão do comitê", 409);
        }
      }

      if (data.actorRole === "auditor" && data.status === "sent_to_committee") {
        if (!data.committeeMemberUserId) {
          throw new AppError("committee_member_user_id é obrigatório ao enviar ao comitê", 400);
        }

        const committeeMember = await transaction.user.findUnique({
          where: { id: data.committeeMemberUserId },
          select: { role: true, accountStatus: true, committeeProfile: { select: { userId: true } } }
        });

        if (
          committeeMember?.role !== "committee" ||
          committeeMember.accountStatus !== "active" ||
          !committeeMember.committeeProfile
        ) {
          throw new AppError("Membro responsável do comitê inválido", 400);
        }
      } else if (data.committeeMemberUserId !== undefined) {
        throw new AppError("committee_member_user_id só pode ser enviado ao encaminhar ao comitê", 400);
      }

      const now = new Date();
      const projectStatus = projectStatusFor(data.status);
      const updated = await transaction.evaluation.updateMany({
        where: { id: evaluation.id, status: evaluation.status },
        data: {
          status: data.status,
          assignedToUserId:
            data.status === "sent_to_committee"
              ? data.committeeMemberUserId
              : data.actorRole === "committee"
                ? evaluation.assignedByUserId
                : evaluation.assignedToUserId,
          assignedByUserId:
            data.status === "sent_to_committee" || data.actorRole === "committee"
              ? data.actorUserId
              : undefined,
          evaluatedByUserId: data.actorUserId,
          justification: data.justification,
          evaluatedAt: data.status === "sent_to_committee" ? null : now,
          updatedAt: now
        }
      });

      if (updated.count !== 1) {
        throw new AppError("A avaliação foi alterada por outra solicitação", 409);
      }

      await transaction.projectVersion.update({
        where: { id: data.projectVersionId },
        data: { status: projectStatus }
      });

      await transaction.projectStatusHistory.create({
        data: {
          projectVersionId: data.projectVersionId,
          status: projectStatus,
          notes: data.justification,
          actorUserId: data.actorUserId,
          evaluationId: evaluation.id
        }
      });

      await transaction.auditLog.create({
        data: {
          userId: data.actorUserId,
          action: "update_auditor_evaluation",
          resourceType: "evaluation",
          resourceId: String(evaluation.id),
          details: JSON.stringify({
            project_version_id: data.projectVersionId,
            previous_status: evaluation.status,
            status: data.status,
            project_status: projectStatus,
            committee_member_user_id: data.committeeMemberUserId ?? null,
            justification: data.justification
          }),
          ipAddress: data.ipAddress
        }
      });

      return loadEvaluation(transaction, data.projectVersionId);
    });
  }
};
