import { basename } from "node:path";
import { resolveProjectDocumentPath } from "../storage/project-document-storage.js";
import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import { PROJECT_STATUS_LABELS } from "@niar/contracts";
import { projectsRepository, type ProjectListFilter, type ProjectRecord } from "../repositories/projects-repository.js";
import type {
  ListProjectsQuery,
  ProjectListResponse,
  ProjectResponse
} from "../schemas/project-schema.js";

const AVAILABLE_DOCUMENT_TYPES = ["project_docx", "submission_bundle", "report", "report_artifact", "filled_questionnaire"];

const toProjectResponse = (project: ProjectRecord, currentUser: AuthenticatedUser): ProjectResponse => {
  const latestVersion = project.versions.at(-1);
  const response: ProjectResponse = {
    id: project.id,
    project_version_id: latestVersion?.id ?? null,
    title: project.title,
    current_version: latestVersion ? {
      id: latestVersion.id,
      version_number: latestVersion.versionNumber,
      status: latestVersion.status,
      revision_evaluation_id: latestVersion.revisionEvaluationId ?? null
    } : null,
    versions: project.versions.map((version) => ({
      id: version.id,
      version_number: version.versionNumber,
      source_wizard_session_id: version.sourceWizardSessionId,
      status: version.status,
      revision_evaluation_id: version.revisionEvaluationId,
      characterization_snapshot: version.characterizationSnapshot,
      submitted_at: version.submittedAt?.toISOString() ?? null
    })),
    updated_at: project.updatedAt.toISOString(),
    researcher: {
      id: project.owner.id,
      full_name: project.owner.fullName,
      email: project.owner.email
    },
    status: project.versions.flatMap((version) =>
      version.statusHistory.map((history) => ({
        code: history.status,
        label: PROJECT_STATUS_LABELS[history.status],
        version_number: version.versionNumber,
        project_version_id: version.id,
        evaluation_id: history.evaluationId ?? null,
        created_at: history.createdAt.toISOString(),
        notes: history.notes
      }))
    ),
    documents: project.versions.flatMap((version) =>
      version.documents
        .filter((document) => currentUser.role === "admin" || AVAILABLE_DOCUMENT_TYPES.includes(document.documentType))
        .map((document) => ({
          id: document.id,
          project_version_id: version.id,
          delivery_number: document.deliveryNumber ?? 0,
          questionnaire_id: document.questionnaireId ?? null,
          version_number: version.versionNumber,
          document_type: document.documentType,
          original_filename: basename(document.originalFilename),
          created_at: document.createdAt.toISOString(),
          download_url: `/api/admin/projects/${project.id}/documents/${document.id}/download`
        }))
    )
  };

  if (currentUser.role !== "researcher") {
    response.evaluation_status = latestVersion?.evaluations[0]?.status ?? "waiting";
    response.evaluations = project.versions.flatMap((version) =>
      [...version.evaluations].reverse().map((evaluation) => ({
        id: evaluation.id,
        project_version_id: version.id,
        round_number: evaluation.roundNumber,
        delivery_number: evaluation.deliveryNumber,
        certification_decision: evaluation.certificationDecision,
        certification_reason: evaluation.certificationReason,
        version_number: version.versionNumber,
        status: evaluation.status,
        justification: evaluation.justification,
        evaluated_at: evaluation.evaluatedAt?.toISOString() ?? null,
        updated_at: evaluation.updatedAt.toISOString()
      }))
    );
  }

  return response;
};

const assertResearcherFilterAllowed = (researcherId: number | undefined, currentUser: AuthenticatedUser) => {
  if (currentUser.role === "researcher" && researcherId !== undefined && researcherId !== currentUser.id) {
    throw new AppError("Pesquisador só pode consultar os próprios projetos", 403);
  }
};

const toRepositoryFilter = (query: ListProjectsQuery, currentUser: AuthenticatedUser): ProjectListFilter => {
  assertResearcherFilterAllowed(query.researcher_id, currentUser);

  if (currentUser.role !== "admin" && query.document_type && !AVAILABLE_DOCUMENT_TYPES.includes(query.document_type)) {
    throw new AppError("Este tipo de documento não está disponível para o perfil autenticado", 403);
  }

  const documentType =
    currentUser.role !== "admin" && query.has_document !== undefined && !query.document_type
      ? "project_docx"
      : query.document_type;

  return {
    page: query.page,
    pageSize: query.page_size,
    currentUserId: currentUser.id,
    currentUserRole: currentUser.role,
    ownerUserId: currentUser.role === "researcher" ? currentUser.id : query.researcher_id,
    status: query.status,
    evaluationStatus: query.evaluation_status,
    submittedFrom: query.submitted_from,
    submittedTo: query.submitted_to,
    updatedFrom: query.updated_from,
    updatedTo: query.updated_to,
    versionNumber: query.version_number,
    documentType,
    hasDocument: query.has_document,
    search: query.search,
    orderBy: query.order_by,
    orderDirection: query.order_direction
  };
};

export const projectsService = {
  listProjects: async (query: ListProjectsQuery, currentUser: AuthenticatedUser): Promise<ProjectListResponse> => {
    const result = await projectsRepository.findAll(toRepositoryFilter(query, currentUser));
    return {
      items: result.items.map((project) => toProjectResponse(project, currentUser)),
      pagination: {
        page: query.page,
        page_size: query.page_size,
        total_items: result.total,
        total_pages: Math.ceil(result.total / query.page_size)
      }
    };
  },

  getProject: async (projectId: number, currentUser: AuthenticatedUser): Promise<ProjectResponse> => {
    const project = await projectsRepository.findById(
      projectId,
      currentUser.role === "researcher" ? currentUser.id : undefined
    );
    if (!project) throw new AppError("Projeto não encontrado", 404);
    return toProjectResponse(project, currentUser);
  },

  getDocumentDownload: async (projectId: number, documentId: number, currentUser: AuthenticatedUser) => {
    const document = await projectsRepository.findDocument(
      projectId,
      documentId,
      currentUser.role === "researcher" ? currentUser.id : undefined
    );
    if (!document) throw new AppError("Documento não encontrado", 404);

    if (currentUser.role !== "admin" && !AVAILABLE_DOCUMENT_TYPES.includes(document.documentType)) {
      throw new AppError("Este tipo de documento não está disponível para o perfil autenticado", 403);
    }

    const filePath = await resolveProjectDocumentPath(document.storagePath);

    return {
      filePath,
      filename: basename(document.originalFilename) || `documento-${document.id}`
    };
  }
};
