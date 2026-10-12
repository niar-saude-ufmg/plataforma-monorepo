import { Prisma, prisma } from "@niar/database";
import type { UserRole } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";

const evaluationDetailsSelect = {
  id: true,
  responsibleMemberUserId: true,
  result: true,
  justification: true,
  evaluatedAt: true,
  createdAt: true,
  updatedAt: true,
  projectVersion: {
    select: {
      id: true,
      projectId: true,
      versionNumber: true,
      status: true,
      userCoepDataId: true,
      submittedAt: true,
      createdAt: true,
      project: {
        select: {
          id: true,
          ownerUserId: true,
          title: true
        }
      }
    }
  },
  responsibleMember: {
    select: {
      userId: true,
      user: {
        select: {
          fullName: true,
          email: true
        }
      },
      specialty: {
        select: {
          id: true,
          code: true,
          name: true
        }
      }
    }
  }
} satisfies Prisma.CommitteeEvaluationSelect;

export type CommitteeEvaluationDetails = Prisma.CommitteeEvaluationGetPayload<{
  select: typeof evaluationDetailsSelect;
}>;

type AssignmentData = {
  projectVersionId: number;
  responsibleMemberUserId: number;
  actorUserId: number;
  ipAddress: string;
};

type FinalizationData = {
  projectVersionId: number;
  actorUserId: number;
  actorRole: UserRole;
  ipAddress: string;
  result: "approved" | "needs_changes" | "rejected";
  justification: string;
};

const loadEvaluation = (client: Prisma.TransactionClient, projectVersionId: number) =>
  client.committeeEvaluation.findUniqueOrThrow({
    where: { projectVersionId },
    select: evaluationDetailsSelect
  });

export const committeeEvaluationsRepository = {
  findByProjectVersionId: async (projectVersionId: number): Promise<CommitteeEvaluationDetails> => {
    const version = await prisma.projectVersion.findUnique({
      where: { id: projectVersionId },
      select: {
        committeeEvaluation: { select: evaluationDetailsSelect }
      }
    });

    if (!version) {
      throw new AppError("Versão do projeto não encontrada", 404);
    }

    if (!version.committeeEvaluation) {
      throw new AppError("Avaliação do comitê não encontrada", 404);
    }

    return version.committeeEvaluation;
  },

  createAssignment: async (data: AssignmentData): Promise<CommitteeEvaluationDetails> => {
    try {
      return await prisma.$transaction(async (transaction) => {
        const version = await transaction.projectVersion.findUnique({
          where: { id: data.projectVersionId },
          select: { committeeEvaluation: { select: { id: true } } }
        });

        if (!version) {
          throw new AppError("Versão do projeto não encontrada", 404);
        }

        const responsibleMember = await transaction.user.findUnique({
          where: { id: data.responsibleMemberUserId },
          select: {
            role: true,
            committeeProfile: {
              select: {
                specialty: { select: { id: true } }
              }
            }
          }
        });

        if (responsibleMember?.role !== "committee" || !responsibleMember.committeeProfile?.specialty) {
          throw new AppError("Membro responsável inválido", 400);
        }

        if (version.committeeEvaluation) {
          throw new AppError("Esta versão já possui uma avaliação atribuída", 409);
        }

        const evaluation = await transaction.committeeEvaluation.create({
          data: {
            projectVersionId: data.projectVersionId,
            responsibleMemberUserId: data.responsibleMemberUserId,
            result: "to_review",
            justification: null,
            evaluatedAt: null
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
            actorUserId: data.actorUserId,
            committeeEvaluationId: evaluation.id,
            notes: null
          }
        });

        await transaction.auditLog.create({
          data: {
            userId: data.actorUserId,
            action: "assign_committee_evaluation",
            resourceType: "committee_evaluation",
            resourceId: String(evaluation.id),
            details: JSON.stringify({
              project_version_id: data.projectVersionId,
              responsible_member_user_id: data.responsibleMemberUserId,
              result: "to_review"
            }),
            ipAddress: data.ipAddress
          }
        });

        return loadEvaluation(transaction, data.projectVersionId);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError("Esta versão já possui uma avaliação atribuída", 409);
      }
      throw error;
    }
  },

  finalize: async (data: FinalizationData): Promise<CommitteeEvaluationDetails> =>
    prisma.$transaction(async (transaction) => {
      const version = await transaction.projectVersion.findUnique({
        where: { id: data.projectVersionId },
        select: {
          committeeEvaluation: {
            select: {
              id: true,
              result: true,
              responsibleMemberUserId: true
            }
          }
        }
      });

      if (!version) {
        throw new AppError("Versão do projeto não encontrada", 404);
      }

      const evaluation = version.committeeEvaluation;

      if (!evaluation) {
        throw new AppError("Avaliação do comitê não encontrada", 404);
      }

      if (data.actorRole === "committee" && evaluation.responsibleMemberUserId !== data.actorUserId) {
        throw new AppError("A avaliação está atribuída a outro membro do comitê", 403);
      }

      if (evaluation.result !== "to_review") {
        throw new AppError("A avaliação desta versão já foi finalizada", 409);
      }

      const now = new Date();
      const updatedEvaluation = await transaction.committeeEvaluation.updateMany({
        where: { id: evaluation.id, result: "to_review" },
        data: {
          result: data.result,
          justification: data.justification,
          evaluatedAt: now,
          updatedAt: now
        }
      });

      // Impede duas finalizações concorrentes.
      if (updatedEvaluation.count !== 1) {
        throw new AppError("A avaliação desta versão já foi finalizada", 409);
      }

      await transaction.projectVersion.update({
        where: { id: data.projectVersionId },
        data: { status: data.result }
      });

      await transaction.projectStatusHistory.create({
        data: {
          projectVersionId: data.projectVersionId,
          status: data.result,
          notes: data.justification,
          actorUserId: data.actorUserId,
          committeeEvaluationId: evaluation.id
        }
      });

      await transaction.auditLog.create({
        data: {
          userId: data.actorUserId,
          action: "finalize_committee_evaluation",
          resourceType: "committee_evaluation",
          resourceId: String(evaluation.id),
          details: JSON.stringify({
            project_version_id: data.projectVersionId,
            result: data.result,
            justification: data.justification
          }),
          ipAddress: data.ipAddress
        }
      });

      return loadEvaluation(transaction, data.projectVersionId);
    })
};
