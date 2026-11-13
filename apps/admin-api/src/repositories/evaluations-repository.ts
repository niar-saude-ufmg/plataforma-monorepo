import { Prisma, prisma } from "@niar/database";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";

const evaluationDetailsSelect = {
  id: true,
  projectVersionId: true,
  assignedToUserId: true,
  assignedByUserId: true,
  evaluatedByUserId: true,
  status: true,
  justification: true,
  certificationDecision: true,
  certificationReason: true,
  evaluatedAt: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: { select: { id: true, fullName: true, email: true, role: true } },
  assignedBy: { select: { id: true, fullName: true, email: true, role: true } },
  evaluatedBy: { select: { id: true, fullName: true, email: true, role: true } },
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

export type EvaluationDetails = Prisma.EvaluationGetPayload<{ select: typeof evaluationDetailsSelect }>;

type AssignmentData = {
  projectVersionId: number;
  assignedToUserId: number;
  actorUserId: number;
  actorRole: UserRole;
  ipAddress: string;
};

type DecisionStatus =
  | "project_approved"
  | "project_rejected"
  | "project_changes_requested"
  | "report_approved"
  | "report_rejected"
  | "report_changes_requested";

type DecisionData = {
  projectVersionId: number;
  actorUserId: number;
  status: DecisionStatus;
  justification: string;
  certificationDecision?: "granted" | "not_granted";
  certificationReason?: string;
  ipAddress: string;
};

const projectReviewStatuses = new Set(["under_review"]);
const reportReviewStatuses = new Set(["report_under_review"]);

const statusForDecision = (status: DecisionStatus) => {
  switch (status) {
    case "project_approved": return "approved_to_schedule" as const;
    case "project_rejected": return "rejected_to_safe_room" as const;
    case "project_changes_requested": return "needs_changes" as const;
    case "report_approved": return "approved" as const;
    case "report_rejected": return "rejected" as const;
    case "report_changes_requested": return "safe_room_reuse_requested" as const;
  }
};

const assertDecisionForPhase = (status: DecisionStatus, projectStatus: string) => {
  if (status.startsWith("project_") && !projectReviewStatuses.has(projectStatus)) {
    throw new AppError("O projeto não está disponível para avaliação inicial", 409);
  }
  if (status.startsWith("report_") && !reportReviewStatuses.has(projectStatus)) {
    throw new AppError("O relatório não está disponível para avaliação", 409);
  }
};

const assertJustification = (status: DecisionStatus, justification: string) => {
  if ((status.endsWith("rejected") || status.endsWith("changes_requested")) && !justification) {
    throw new AppError("Justificativa é obrigatória para esta decisão", 400);
  }
};

export const evaluationsRepository = {
  findByProjectVersionId: async (projectVersionId: number): Promise<EvaluationDetails> => {
    const evaluation = await prisma.evaluation.findFirst({
      where: { projectVersionId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: evaluationDetailsSelect
    });
    if (!evaluation) throw new AppError("Avaliação não encontrada", 404);
    return evaluation;
  },

  assign: async (data: AssignmentData) => prisma.$transaction(async (transaction) => {
    const version = await transaction.projectVersion.findUnique({
      where: { id: data.projectVersionId },
      select: { id: true, status: true, projectId: true, evaluations: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true } } }
    });
    if (!version) throw new AppError("Versão do projeto não encontrada", 404);
    if (data.actorRole !== "admin" && data.assignedToUserId !== data.actorUserId) {
      throw new AppError("O membro do comitê só pode assumir o próprio projeto", 403);
    }

    const member = await transaction.user.findUnique({
      where: { id: data.assignedToUserId },
      select: { role: true, accountStatus: true, committeeProfile: { select: { userId: true } } }
    });
    if (member?.role !== "committee" || member.accountStatus !== "active" || !member.committeeProfile) {
      throw new AppError("O responsável precisa ser um membro ativo do comitê", 400);
    }
    if (version.evaluations[0]) throw new AppError("Esta versão já possui uma avaliação atribuída", 409);

    const evaluation = await transaction.evaluation.create({
      data: { projectVersionId: version.id, assignedToUserId: data.assignedToUserId, assignedByUserId: data.actorUserId, status: "to_review" },
      select: { id: true }
    });

    const nextStatus = version.status === "report_submitted" || version.status === "report_resubmitted"
      ? "report_under_review"
      : "under_review";
    await transaction.projectVersion.update({ where: { id: version.id }, data: { status: nextStatus } });
    await transaction.projectStatusHistory.create({
      data: { projectVersionId: version.id, status: nextStatus, notes: "Projeto atribuído para avaliação do comitê.", actorUserId: data.actorUserId, evaluationId: evaluation.id }
    });
    await transaction.auditLog.create({
      data: {
        userId: data.actorUserId,
        action: "assign_evaluation",
        resourceType: "evaluation",
        resourceId: String(evaluation.id),
        details: JSON.stringify({ project_version_id: version.id, assigned_to_user_id: data.assignedToUserId, status: "to_review" }),
        ipAddress: data.ipAddress
      }
    });
    return transaction.evaluation.findUniqueOrThrow({ where: { id: evaluation.id }, select: evaluationDetailsSelect });
  }),

  decide: async (data: DecisionData): Promise<EvaluationDetails> => {
    assertJustification(data.status, data.justification);
    return prisma.$transaction(async (transaction) => {
      const version = await transaction.projectVersion.findUnique({
        where: { id: data.projectVersionId },
        select: { id: true, status: true, evaluations: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, assignedToUserId: true } } }
      });
      if (!version) throw new AppError("Versão do projeto não encontrada", 404);
      const evaluation = version.evaluations[0];
      if (!evaluation) throw new AppError("Avaliação não encontrada", 404);
      if (evaluation.assignedToUserId !== data.actorUserId) {
        throw new AppError("O projeto está atribuído a outro membro do comitê", 403);
      }
      assertDecisionForPhase(data.status, version.status);

      const now = new Date();
      await transaction.evaluation.update({
        where: { id: evaluation.id },
        data: {
          evaluatedByUserId: data.actorUserId,
          status: data.status,
          justification: data.justification || null,
          certificationDecision: data.certificationDecision,
          certificationReason: data.certificationReason || null,
          evaluatedAt: now
        }
      });
      const projectStatus = statusForDecision(data.status);
      await transaction.projectVersion.update({ where: { id: version.id }, data: { status: projectStatus } });
      await transaction.projectStatusHistory.create({
        data: { projectVersionId: version.id, status: projectStatus, notes: data.justification || null, actorUserId: data.actorUserId, evaluationId: evaluation.id }
      });
      await transaction.auditLog.create({
        data: {
          userId: data.actorUserId,
          action: "record_project_evaluation",
          resourceType: "evaluation",
          resourceId: String(evaluation.id),
          details: JSON.stringify({ project_version_id: version.id, status: data.status, project_status: projectStatus, certification_decision: data.certificationDecision ?? null }),
          ipAddress: data.ipAddress
        }
      });
      return transaction.evaluation.findUniqueOrThrow({ where: { id: evaluation.id }, select: evaluationDetailsSelect });
    });
  }
};
