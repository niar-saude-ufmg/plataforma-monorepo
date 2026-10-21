import type { ApiError } from "../../types/api.types";
import type {
  EvaluationStatus,
  ProjectListPagination,
  Project,
  ProjectDocument,
  ProjectEvaluation,
  ProjectListParams,
  ProjectListResponse,
  ProjectStatusEntry,
  ResearcherSummary,
} from "../../types/project.types";
import { getAdminApiBaseUrl } from "../auth/auth.service";
import { ACCESS_TOKEN_STORAGE_KEY } from "@niar/auth";
import {
  getFilenameFromContentDisposition,
  type DownloadedFile,
} from "../../utils/download-file";


export function toResearcher(raw: any): ResearcherSummary {
  return {
    id: raw.id,
    fullName: raw.full_name,
    email: raw.email,
  };
}

export function toStatusEntry(raw: any): ProjectStatusEntry {
  return {
    code: raw.code,
    label: raw.label,
    versionNumber: raw.version_number,
    createdAt: raw.created_at,
    notes: raw.notes,
  };
}

export function toDocument(raw: any): ProjectDocument {
  return {
    id: raw.id,
    versionNumber: raw.version_number,
    documentType: raw.document_type,
    originalFilename: raw.original_filename,
    createdAt: raw.created_at,
  };
}

export function toEvaluationUser(raw: any) {
  if (!raw) return null;

  return {
    userId: raw.user_id,
    fullName: raw.full_name,
    email: raw.email,
    role: raw.role,
  };
}

export function toEvaluation(raw: any): ProjectEvaluation {
  return {
    id: raw.id,
    versionNumber: raw.version_number,
    status: raw.status,
    assignedTo: toEvaluationUser(raw.assigned_to),
    assignedBy: toEvaluationUser(raw.assigned_by),
    justification: raw.justification,
    evaluatedAt: raw.evaluated_at,
    updatedAt: raw.updated_at,
  };
}

export function toProject(raw: any): Project {
  const project: Project = {
    id: raw.id,
    title: raw.title,
    updatedAt: raw.updated_at,
    researcher: toResearcher(raw.researcher),
    status: (raw.status ?? []).map(toStatusEntry),
    documents: (raw.documents ?? []).map(toDocument),
  };

  // Só admin/committee/auditor recebem esses campos
  if (raw.evaluation_status !== undefined) {
    project.evaluationStatus = raw.evaluation_status;
  }
  if (raw.evaluation_context !== undefined) {
    project.evaluationContext = raw.evaluation_context;
  }
  if (raw.evaluations !== undefined) {
    project.evaluations = raw.evaluations.map(toEvaluation);
  }

  return project;
}

export function toProjectListPagination(raw: any): ProjectListPagination {
  return {
    page: raw.page,
    pageSize: raw.page_size,
    totalItems: raw.total_items,
    totalPages: raw.total_pages,
  };
}

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getProjectsRequest(
  params: ProjectListParams = {},
): Promise<ProjectListResponse> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("page_size", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.evaluationStatus) query.set("evaluation_status", params.evaluationStatus);
  if (params.evaluationContext) query.set("evaluation_context", params.evaluationContext);
  if (params.submittedFrom) query.set("submitted_from", params.submittedFrom);
  if (params.submittedTo) query.set("submitted_to", params.submittedTo);
  if (params.updatedFrom) query.set("updated_from", params.updatedFrom);
  if (params.updatedTo) query.set("updated_to", params.updatedTo);
  if (params.versionNumber !== undefined) query.set("version_number", String(params.versionNumber));
  if (params.documentType) query.set("document_type", params.documentType);
  if (params.hasDocument !== undefined) query.set("has_document", String(params.hasDocument));
  if (params.search) query.set("search", params.search);
  if (params.orderBy) query.set("order_by", params.orderBy);
  if (params.orderDirection) query.set("order_direction", params.orderDirection);

  const queryString = query.toString();
  const url = `${getAdminApiBaseUrl()}/projects${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, { headers: authHeaders() });

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    throw await normalizeProjectApiError(response.status, body);
  }

  const body = await response.json();
  return {
    items: body.items.map(toProject),
    pagination: toProjectListPagination(body.pagination),
  };
}

export async function getProjectRequest(projectId: number): Promise<Project> {
  const response = await fetch(
    `${getAdminApiBaseUrl()}/projects/${projectId}`,
    { headers: authHeaders() },
  );


  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    throw await normalizeProjectApiError(response.status, body);
  }

  const body = await response.json();
  return toProject(body);
}

export async function downloadProjectDocumentRequest(
  projectId: number,
  documentId: number,
): Promise<DownloadedFile> {
  let response: Response;

  try {
    response = await fetch(
      `${getAdminApiBaseUrl()}/projects/${projectId}/documents/${documentId}/download`,
      { headers: authHeaders() },
    );
  } catch {
    throw normalizeProjectDocumentApiError("FETCH_ERROR");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    throw normalizeProjectDocumentApiError(response.status, body);
  }

  return {
    blob: await response.blob(),
    filename: getFilenameFromContentDisposition(
      response.headers.get("Content-Disposition"),
      `documento-projeto-${projectId}-${documentId}`,
    ),
  };
}

export function normalizeProjectDocumentApiError(
  status: number | string,
  _body?: unknown,
): ApiError {
  const numericStatus = typeof status === "number" ? status : undefined;

  if (numericStatus === 401) {
    return { status: 401, message: "Sessão expirada. Faça login novamente." };
  }
  if (numericStatus === 403) {
    return { status: 403, message: "Você não tem acesso a este documento." };
  }
  if (numericStatus === 404) {
    return { status: 404, message: "Documento do projeto não encontrado." };
  }
  if (numericStatus === 500) {
    return { status: 500, message: "Erro no servidor. Tente novamente." };
  }

  return {
    status: numericStatus,
    message: "Não foi possível baixar o documento do projeto. Tente novamente.",
  };
}

export function normalizeProjectApiError(
  status: number | string,
  body: unknown,
): ApiError {
  const numericStatus = typeof status === "number" ? status : undefined;

  if (numericStatus === 401) {
    return { status: 401, message: "Sessão expirada. Faça login novamente." };
  }
  if (numericStatus === 403) {
    return { status: 403, message: "Você não tem acesso a estes projetos." };
  }
  if (numericStatus === 404) {
    return { status: 404, message: "Projeto não encontrado." };
  }
  if (numericStatus === 400 || numericStatus === 422) {
    return {
      status: numericStatus,
      message: "Revise os parâmetros da consulta.",
    };
  }
  if (numericStatus === 500) {
    return { status: 500, message: "Erro no servidor. Tente novamente." };
  }

  return {
    status: numericStatus,
    message: "Não foi possível carregar os projetos. Tente novamente.",
  };
}
