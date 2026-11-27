import { Prisma, prisma } from "@niar/database";
import type { UserRole } from "@niar/contracts";
import { resolveProjectDocumentPath } from "../storage/project-document-storage.js";
import { AppError } from "../errors/app-error.js";

const evaluationDetailsSelect = {
  id: true,
  roundNumber: true,
  deliveryNumber: true,
  committeeMemberUserId: true,
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
  evaluationId?: number;
  projectVersionId: number;
  actorUserId: number;
  status: DecisionStatus;
  justification: string;
  certificationDecision?: "granted" | "not_granted";
  certificationReason?: string;
  ipAddress: string;
};

type ReportDeliveryData = {
  projectVersionId: number;
  actorUserId: number;
  actorRole: UserRole;
  ipAddress: string;
  deliveryNumber: number;
  documents: { sourceExportArtifactId: number; questionnaireId?: number }[];
};

const loadEvaluation = (client: Prisma.TransactionClient, projectVersionId: number) =>
  client.evaluation.findFirstOrThrow({
    where: { projectVersionId },
    orderBy: [{ roundNumber: "desc" }, { id: "desc" }],
    select: evaluationDetailsSelect
  });

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
  if (status.startsWith("project_") && projectStatus !== "under_review") {
    throw new AppError("O projeto não está disponível para avaliação inicial", 409);
  }
  if (status.startsWith("report_") && projectStatus !== "report_under_review") {
    throw new AppError("O relatório não está disponível para avaliação", 409);
  }
};

const assertDecision = (data: DecisionData) => {
  if ((data.status.endsWith("rejected") || data.status.endsWith("changes_requested")) && !data.justification.trim()) {
    throw new AppError("Justificativa é obrigatória para esta decisão", 400);
  }
  if (data.status !== "report_approved" && (data.certificationDecision !== undefined || data.certificationReason?.trim())) {
    throw new AppError("A decisão sobre o selo só pode ser registrada ao aprovar o relatório", 400);
  }
  if (data.status === "report_approved" && !data.certificationDecision) {
    throw new AppError("A decisão sobre o selo é obrigatória ao aprovar o relatório", 400);
  }
  if (data.certificationDecision === "not_granted" && !data.certificationReason?.trim()) {
    throw new AppError("A justificativa é obrigatória quando o selo não é concedido", 400);
  }
};

const lockCurrentVersion = async (transaction: Prisma.TransactionClient, projectVersionId: number) => {
  const linked = await transaction.projectVersion.findUnique({ where: { id: projectVersionId }, select: { projectId: true } });
  if (!linked) throw new AppError("Versão do projeto não encontrada", 404);
  await transaction.$queryRaw`SELECT id FROM admin.projects WHERE id = ${linked.projectId} FOR UPDATE`;
  const latest = await transaction.projectVersion.findFirst({
    where: { projectId: linked.projectId }, orderBy: { versionNumber: "desc" }, select: { id: true }
  });
  if (latest?.id !== projectVersionId) throw new AppError("Esta versão do projeto não é a atual", 409);
};

export const evaluationsRepository = {
  findByProjectVersionId: async (projectVersionId: number): Promise<EvaluationDetails> => {
    const evaluation = await prisma.evaluation.findFirst({
      where: { projectVersionId },
      orderBy: [{ roundNumber: "desc" }, { id: "desc" }],
      select: evaluationDetailsSelect
    });
    if (!evaluation) throw new AppError("Avaliação não encontrada", 404);
    return evaluation;
  },

  assign: async (data: AssignmentData) => prisma.$transaction(async (transaction) => {
    await lockCurrentVersion(transaction, data.projectVersionId);
    const version = await transaction.projectVersion.findUnique({
      where: { id: data.projectVersionId },
      select: { id: true, status: true, projectId: true, evaluations: { orderBy: { roundNumber: "desc" }, take: 1, select: { id: true } } }
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
    if (!["submitted_for_review", "resubmitted_for_review", "submitted_to_committee", "resubmitted_to_committee"].includes(version.status)) {
      throw new AppError("Versão indisponível para atribuição; entregas de relatório preservam o responsável", 409);
    }

    const evaluation = await transaction.evaluation.create({
      data: { projectVersionId: version.id, assignedToUserId: data.assignedToUserId, assignedByUserId: data.actorUserId, committeeMemberUserId: data.assignedToUserId, roundNumber: 1, deliveryNumber: 0, status: "to_review" },
      select: { id: true }
    });

    const nextStatus = "under_review";
    await transaction.projectVersion.update({ where: { id: version.id }, data: { status: nextStatus } });
    await transaction.project.updateMany({ where: { versions: { some: { id: data.projectVersionId } } }, data: { updatedAt: new Date() } });
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

  receiveReport: async (data: ReportDeliveryData) =>
    prisma.$transaction(async (transaction) => {
      await lockCurrentVersion(transaction, data.projectVersionId);
      const version = await transaction.projectVersion.findUniqueOrThrow({
        where: { id: data.projectVersionId }, include: { project: true }
      });
      if (data.actorRole !== "admin" && (data.actorRole !== "researcher" || version.project.ownerUserId !== data.actorUserId)) {
        throw new AppError("Usuário não autorizado para entregar relatório", 403);
      }
      const previous = await transaction.evaluation.findFirst({
        where: { projectVersionId: data.projectVersionId }, orderBy: { roundNumber: "desc" }, select: evaluationDetailsSelect
      });
      if (!previous?.committeeMemberUserId) throw new AppError("Projeto sem responsável do Comitê", 409);
      const first = previous.deliveryNumber === 0;
      if (data.deliveryNumber !== previous.deliveryNumber + 1 ||
          !(first ? ["under_safe_room"] : ["safe_room_reuse_requested", "under_safe_room", "reapproved_for_safe_room"]).includes(version.status) ||
          (!first && !["report_changes_requested", "needs_changes", "needs_changes_by_committee"].includes(previous.status))) {
        throw new AppError("Entrega duplicada, fora de sequência ou sem solicitação vigente", 409);
      }
      const artifacts = await transaction.exportArtifact.findMany({
        where: { id: { in: data.documents.map((doc) => doc.sourceExportArtifactId) },
          session: { userId: version.project.ownerUserId, OR: [{ id: version.sourceWizardSessionId }, { linkedProjectId: version.sourceWizardSessionId, wizardType: "data_clean" }] } }
      });
      if (artifacts.length !== data.documents.length || artifacts.some((artifact) => !["report", "report_artifact", "filled_questionnaire"].includes(artifact.artifactType))) {
        throw new AppError("Artefatos de relatório inválidos ou fora do projeto", 400);
      }
      let storagePaths: string[];
      try {
        storagePaths = await Promise.all(artifacts.map((artifact) => resolveProjectDocumentPath(artifact.filePath)));
      } catch (error) {
        if (error instanceof AppError && error.statusCode === 404) {
          throw new AppError("Arquivo do artefato não encontrado ou indisponível no diretório de exports", 400);
        }
        throw error;
      }
      if (new Set(storagePaths).size !== storagePaths.length) {
        throw new AppError("A entrega contém referências ao mesmo arquivo", 400);
      }
      if (await transaction.projectDocument.count({ where: { OR: [{ sourceExportArtifactId: { in: artifacts.map((artifact) => artifact.id) } }, { storagePath: { in: [...storagePaths, ...artifacts.map((artifact) => artifact.filePath)] } }] } })) {
        throw new AppError("Artefato já entregue; gere um novo arquivo para a revisão", 409);
      }
      for (const [index, artifact] of artifacts.entries()) {
        const input = data.documents.find((doc) => doc.sourceExportArtifactId === artifact.id)!;
        if (artifact.artifactType === "filled_questionnaire" && !artifact.questionnaireId) {
          throw new AppError("Questionário preenchido exige a definição e versão exatas", 400);
        }
        if (input.questionnaireId !== undefined && input.questionnaireId !== artifact.questionnaireId) {
          throw new AppError("A definição deve corresponder ao questionário utilizado no artefato", 400);
        }
        if (artifact.questionnaireId) {
          const questionnaire = await transaction.questionnaire.findUnique({ where: { id: artifact.questionnaireId } });
          if (!questionnaire?.publishedAt) throw new AppError("Artefato exige definição de questionário publicada", 400);
        }
        await transaction.projectDocument.create({ data: {
          projectVersionId: version.id, deliveryNumber: data.deliveryNumber,
          sourceExportArtifactId: artifact.id, documentType: artifact.artifactType,
          originalFilename: artifact.filename, storagePath: storagePaths[index], questionnaireId: artifact.questionnaireId
        } });
      }
      const evaluation = await transaction.evaluation.create({ data: {
        projectVersionId: version.id, roundNumber: previous.roundNumber + 1,
        deliveryNumber: data.deliveryNumber, status: "to_review",
        assignedToUserId: previous.committeeMemberUserId, assignedByUserId: previous.assignedByUserId,
        committeeMemberUserId: previous.committeeMemberUserId
      }, select: { id: true } });
      const status = first ? "report_submitted" : "report_resubmitted";
      await transaction.projectVersion.update({ where: { id: version.id }, data: { status: "report_under_review" } });
      await transaction.project.update({ where: { id: version.projectId }, data: { updatedAt: new Date() } });
      await transaction.projectStatusHistory.create({ data: {
        projectVersionId: version.id, evaluationId: evaluation.id, status, actorUserId: data.actorUserId,
        notes: `Entrega de relatório ${data.deliveryNumber}`
      } });
      await transaction.projectStatusHistory.create({ data: {
        projectVersionId: version.id, evaluationId: evaluation.id, status: "report_under_review", actorUserId: data.actorUserId,
        notes: "Relatório encaminhado ao responsável do Comitê."
      } });
      await transaction.auditLog.create({ data: {
        userId: data.actorUserId, action: "receive_project_report", resourceType: "evaluation", resourceId: String(evaluation.id),
        ipAddress: data.ipAddress, details: JSON.stringify({
          project_version_id: version.id,
          delivery_number: data.deliveryNumber,
          documents: data.documents.map((document) => ({
            source_export_artifact_id: document.sourceExportArtifactId,
            questionnaire_id: document.questionnaireId
          }))
        })
      } });
      return loadEvaluation(transaction, version.id);
    }),

  decide: async (data: DecisionData): Promise<EvaluationDetails> => {
    assertDecision(data);
    return prisma.$transaction(async (transaction) => {
      await lockCurrentVersion(transaction, data.projectVersionId);
      const version = await transaction.projectVersion.findUnique({
        where: { id: data.projectVersionId },
        select: { id: true, status: true, evaluations: { orderBy: { roundNumber: "desc" }, take: 1, select: { id: true, assignedToUserId: true, assignedByUserId: true, committeeMemberUserId: true, status: true, roundNumber: true, deliveryNumber: true } } }
      });
      if (!version) throw new AppError("Versão do projeto não encontrada", 404);
      const evaluation = version.evaluations[0];
      if (!evaluation) throw new AppError("Avaliação não encontrada", 404);
      if (evaluation.assignedToUserId !== data.actorUserId) {
        throw new AppError("O projeto está atribuído a outro membro do comitê", 403);
      }
      if (data.evaluationId !== undefined && data.evaluationId !== evaluation.id) {
        throw new AppError("A avaliação foi alterada por outra solicitação", 409);
      }
      if (data.status.startsWith("report_") && data.evaluationId === undefined) {
        throw new AppError("evaluation_id é obrigatório para avaliar a entrega de relatório", 400);
      }
      if (evaluation.status !== "to_review") throw new AppError("Esta rodada já foi avaliada", 409);
      if (data.status.startsWith("report_") !== (evaluation.deliveryNumber > 0)) {
        throw new AppError("A decisão não corresponde à entrega avaliada", 409);
      }
      assertDecisionForPhase(data.status, version.status);

      const now = new Date();
      const decision = await transaction.evaluation.create({
        data: {
          projectVersionId: version.id,
          roundNumber: evaluation.roundNumber + 1,
          deliveryNumber: evaluation.deliveryNumber,
          assignedToUserId: evaluation.assignedToUserId,
          assignedByUserId: evaluation.assignedByUserId,
          committeeMemberUserId: evaluation.committeeMemberUserId,
          evaluatedByUserId: data.actorUserId,
          status: data.status,
          justification: data.justification || null,
          certificationDecision: data.certificationDecision,
          certificationReason: data.certificationReason || null,
          evaluatedAt: now
        }
      });
      const projectStatus = statusForDecision(data.status);
      await transaction.project.updateMany({ where: { versions: { some: { id: data.projectVersionId } } }, data: { updatedAt: new Date() } });
      await transaction.projectVersion.update({ where: { id: version.id }, data: { status: projectStatus } });
      await transaction.projectStatusHistory.create({
        data: { projectVersionId: version.id, status: projectStatus, notes: data.justification || null, actorUserId: data.actorUserId, evaluationId: decision.id }
      });
      await transaction.auditLog.create({
        data: {
          userId: data.actorUserId,
          action: "record_project_evaluation",
          resourceType: "evaluation",
          resourceId: String(decision.id),
          details: JSON.stringify({ project_version_id: version.id, status: data.status, project_status: projectStatus, certification_decision: data.certificationDecision ?? null }),
          ipAddress: data.ipAddress
        }
      });
      return transaction.evaluation.findUniqueOrThrow({ where: { id: decision.id }, select: evaluationDetailsSelect });
    });
  }
};
