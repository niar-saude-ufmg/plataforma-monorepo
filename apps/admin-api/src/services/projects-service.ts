import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import { projectsRepository, type ProjectListFilter, type ProjectRecord } from "../repositories/projects-repository.js";
import type { ListProjectsQuery, ProjectResponse, ProjectStatusCode } from "../schemas/project-schema.js";

const PROJECT_STATUS_LABELS: Record<ProjectStatusCode, string> = {
  submitted_to_committee: "Enviado à comissão",
  resubmitted_to_committee: "Reenviado à comissão",
  under_review: "Em avaliação",
  needs_changes: "Precisa de alterações",
  approved: "Aprovado",
  rejected: "Rejeitado"
};

const toProjectResponse = (project: ProjectRecord, currentUser: AuthenticatedUser): ProjectResponse => ({
  id: project.id,
  title: project.title,
  updated_at: project.updatedAt.toISOString(),
  status: project.versions.flatMap((version) =>
    version.statusHistory.map((history) => ({
      code: history.status,
      label: PROJECT_STATUS_LABELS[history.status],
      version_number: version.versionNumber,
      created_at: history.createdAt.toISOString(),
      notes: history.notes
    }))
  ),
  documents: project.versions.flatMap((version) =>
    version.documents
      .filter((document) => currentUser.role === "admin" || document.documentType === "project_docx")
      .map((document) => ({
      id: document.id,
      version_number: version.versionNumber,
      document_type: document.documentType,
      original_filename: basename(document.originalFilename),
      created_at: document.createdAt.toISOString(),
      download_url: `/api/admin/projects/${project.id}/documents/${document.id}/download`
    }))
  )
});

const ownerScopeFor = (currentUser: AuthenticatedUser): number | undefined =>
  currentUser.role === "researcher" ? currentUser.id : undefined;

const assertResearcherFilterAllowed = (researcherId: number | undefined, currentUser: AuthenticatedUser) => {
  if (currentUser.role === "researcher" && researcherId !== undefined && researcherId !== currentUser.id) {
    throw new AppError("Pesquisador só pode consultar os próprios projetos", 403);
  }
};

const toRepositoryFilter = (query: ListProjectsQuery, currentUser: AuthenticatedUser): ProjectListFilter => {
  assertResearcherFilterAllowed(query.researcher_id, currentUser);

  if (currentUser.role !== "admin" && query.document_type && query.document_type !== "project_docx") {
    throw new AppError("Este tipo de documento não está disponível para o perfil autenticado", 403);
  }

  const documentType =
    currentUser.role !== "admin" && query.has_document !== undefined
      ? "project_docx"
      : query.document_type;

  return {
    page: query.page,
    pageSize: query.page_size,
    ownerUserId: currentUser.role === "researcher" ? currentUser.id : query.researcher_id,
    status: query.status,
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
  listProjects: async (query: ListProjectsQuery, currentUser: AuthenticatedUser): Promise<ProjectResponse[]> => {
    const projects = await projectsRepository.findAll(toRepositoryFilter(query, currentUser));
    return projects.map((project) => toProjectResponse(project, currentUser));
  },

  getProject: async (projectId: number, currentUser: AuthenticatedUser): Promise<ProjectResponse> => {
    const project = await projectsRepository.findById(projectId, ownerScopeFor(currentUser));
    if (!project) throw new AppError("Projeto não encontrado", 404);
    return toProjectResponse(project, currentUser);
  },

  getDocumentDownload: async (projectId: number, documentId: number, currentUser: AuthenticatedUser) => {
    const document = await projectsRepository.findDocument(projectId, documentId, ownerScopeFor(currentUser));
    if (!document) throw new AppError("Documento não encontrado", 404);

    if (currentUser.role !== "admin" && document.documentType !== "project_docx") {
      throw new AppError("Este tipo de documento não está disponível para o perfil autenticado", 403);
    }

    const filePath = resolve(document.storagePath);
    try {
      await access(filePath, constants.R_OK);
    } catch {
      throw new AppError("Arquivo do documento não encontrado", 404);
    }

    return {
      filePath,
      filename: basename(document.originalFilename) || `documento-${document.id}`
    };
  }
};
