import { constants } from "node:fs";
import { access, realpath } from "node:fs/promises";
import { basename, isAbsolute, relative, resolve, sep } from "node:path";
import { AppError } from "../errors/app-error.js";
import type { AuthenticatedUser } from "../middlewares/auth.js";
import { PROJECT_STATUS_LABELS } from "@niar/contracts";
import { projectsRepository, type ProjectListFilter, type ProjectRecord } from "../repositories/projects-repository.js";
import type {
  ListProjectsQuery,
  ProjectEvaluationStatusCode,
  ProjectListResponse,
  ProjectResponse
} from "../schemas/project-schema.js";

const evaluationStatusFor = (project: ProjectRecord): ProjectEvaluationStatusCode => {
  const latestVersion = project.versions.at(-1);
  return latestVersion?.evaluations?.[0]?.status ?? "waiting";
};

const evaluationContextFor = (project: ProjectRecord) => {
  const latestVersion = project.versions.at(-1);
  return latestVersion?.evaluations?.[0]?.context ?? null;
};

const DEFAULT_EXPORTS_DIR = resolve(process.cwd(), "apps/assistente-api/.local/exports");

const exportsDirectory = () => resolve(process.env.EXPORTS_DIR ?? DEFAULT_EXPORTS_DIR);

const isWithinDirectory = (directory: string, candidate: string) => {
  const relativePath = relative(directory, candidate);
  return relativePath !== "" && relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath);
};

const safeDocumentPath = async (storagePath: string) => {
  try {
    const rootPath = await realpath(exportsDirectory());
    const requestedPath = isAbsolute(storagePath)
      ? resolve(storagePath)
      : resolve(rootPath, storagePath);
    const filePath = await realpath(requestedPath);

    if (!isWithinDirectory(rootPath, filePath)) {
      throw new Error("Documento fora do diretório de exports");
    }

    await access(filePath, constants.R_OK);
    return filePath;
  } catch {
    throw new AppError("Arquivo do documento não encontrado", 404);
  }
};

const toProjectResponse = (project: ProjectRecord, currentUser: AuthenticatedUser): ProjectResponse => {
  const response: ProjectResponse = {
    id: project.id,
    title: project.title,
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
  };

  if (currentUser.role !== "researcher") {
    response.evaluation_status = evaluationStatusFor(project);
    response.evaluation_context = evaluationContextFor(project);
    response.evaluations = project.versions.flatMap((version) => {
      const evaluation = version.evaluations[0];
      if (!evaluation) return [];

      return [{
        id: evaluation.id,
        version_number: version.versionNumber,
        status: evaluation.status,
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
        justification: evaluation.justification,
        evaluated_at: evaluation.evaluatedAt?.toISOString() ?? null,
        updated_at: evaluation.updatedAt.toISOString()
      }];
    });
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
    currentUserId: currentUser.id,
    currentUserRole: currentUser.role,
    ownerUserId: currentUser.role === "researcher" ? currentUser.id : query.researcher_id,
    status: query.status,
    evaluationStatus: query.evaluation_status,
    evaluationContext: query.evaluation_context,
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

    if (currentUser.role !== "admin" && document.documentType !== "project_docx") {
      throw new AppError("Este tipo de documento não está disponível para o perfil autenticado", 403);
    }

    const filePath = await safeDocumentPath(document.storagePath);

    return {
      filePath,
      filename: basename(document.originalFilename) || `documento-${document.id}`
    };
  }
};
