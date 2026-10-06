import { afterAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { writeFile, unlink } from "node:fs/promises";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { UserRole } from "@niar/contracts";
import type { ProjectListFilter, ProjectListResult, ProjectRecord } from "../src/repositories/projects-repository.js";

process.env.SECRET_KEY = "test-secret";
process.env.EXPORTS_DIR = "/tmp";

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: "active";
};

type DownloadRecord = {
  id: number;
  documentType: string;
  originalFilename: string;
  storagePath: string;
  projectVersion: { versionNumber: number };
};

const findAll = jest.fn<(filter: ProjectListFilter) => Promise<ProjectListResult>>();
const findByProjectId = jest.fn<(projectId: number, ownerUserId?: number) => Promise<ProjectRecord | null>>();
const findDocument = jest.fn<
  (projectId: number, documentId: number, ownerUserId?: number) => Promise<DownloadRecord | null>
>();
const findUserById = jest.fn<(id: number) => Promise<StoredUser | null>>();

jest.unstable_mockModule("../src/repositories/projects-repository.js", () => ({
  projectsRepository: { findAll, findById: findByProjectId, findDocument }
}));

jest.unstable_mockModule("../src/repositories/users-repository.js", () => ({
  usersRepository: { findById: findUserById }
}));

const { app } = await import("../src/app.js");

const downloadPath = "/tmp/niar-admin-project-download-test.docx";

const tokenFor = (userId: number) =>
  jwt.sign({ sub: String(userId) }, process.env.SECRET_KEY!, { algorithm: "HS256" });

const authUser = (id: number, role: UserRole): StoredUser => ({
  id,
  email: `${role}${id}@niar.local`,
  fullName: `Usuário ${id}`,
  role,
  accountStatus: "active"
});

const projectRecord = (): ProjectRecord =>
  ({
    id: 42,
    ownerUserId: 10,
    title: "Projeto de pesquisa",
    submittedAt: new Date("2026-09-20T10:00:00.000Z"),
    createdAt: new Date("2026-09-20T10:00:00.000Z"),
    updatedAt: new Date("2026-09-25T12:00:00.000Z"),
    versions: [
      {
        id: 51,
        projectId: 42,
        versionNumber: 1,
        sourceWizardSessionId: 7,
        userCoepDataId: null,
        characterizationSnapshot: {},
        status: "needs_changes",
        submittedAt: new Date("2026-09-20T10:00:00.000Z"),
        createdAt: new Date("2026-09-20T10:00:00.000Z"),
        statusHistory: [
          {
            id: 70,
            projectVersionId: 51,
            status: "submitted_to_committee",
            notes: null,
            actorUserId: 10,
            committeeEvaluationId: null,
            createdAt: new Date("2026-09-20T10:00:00.000Z")
          },
          {
            id: 71,
            projectVersionId: 51,
            status: "needs_changes",
            notes: "Complementar metodologia",
            actorUserId: 20,
            committeeEvaluationId: null,
            createdAt: new Date("2026-09-21T14:00:00.000Z")
          }
        ],
        documents: [
          {
            id: 101,
            projectVersionId: 51,
            sourceExportArtifactId: 88,
            documentType: "project_docx",
            originalFilename: "projeto-v1.docx",
            storagePath: "/segredo/interno/projeto-v1.docx",
            createdAt: new Date("2026-09-20T10:00:00.000Z")
          }
        ]
      }
    ]
  }) as ProjectRecord;

beforeEach(() => {
  findAll.mockReset();
  findByProjectId.mockReset();
  findDocument.mockReset();
  findUserById.mockReset();
});

afterAll(async () => {
  await unlink(downloadPath).catch(() => undefined);
});

describe("GET /api/admin/projects", () => {
  it("exige autenticação", async () => {
    const response = await request(app).get("/api/admin/projects");
    expect(response.status).toBe(401);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("limita pesquisador aos próprios projetos", async () => {
    findUserById.mockResolvedValueOnce(authUser(10, "researcher"));
    findAll.mockResolvedValueOnce({ items: [], total: 0 });

    const response = await request(app)
      .get("/api/admin/projects?page=2&page_size=5")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith(
      expect.objectContaining({ ownerUserId: 10, page: 2, pageSize: 5 })
    );
  });

  it("não permite que pesquisador filtre por outro pesquisador", async () => {
    findUserById.mockResolvedValueOnce(authUser(10, "researcher"));

    const response = await request(app)
      .get("/api/admin/projects?researcher_id=11")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(403);
    expect(findAll).not.toHaveBeenCalled();
  });

  it("repassa paginação e filtros seguros para administrador", async () => {
    findUserById.mockResolvedValueOnce(authUser(20, "admin"));
    findAll.mockResolvedValueOnce({ items: [], total: 0 });

    const response = await request(app)
      .get(
        "/api/admin/projects?page=3&page_size=10&status=needs_changes&researcher_id=10&version_number=2&document_type=project_docx&has_document=true&search=42&submitted_from=2026-09-01&updated_to=2026-09-30&order_by=id&order_direction=asc"
      )
      .set("Authorization", `Bearer ${tokenFor(20)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 3,
        pageSize: 10,
        status: "needs_changes",
        ownerUserId: 10,
        versionNumber: 2,
        documentType: "project_docx",
        hasDocument: true,
        search: "42",
        orderBy: "id",
        orderDirection: "asc"
      })
    );
  });

  it("considera o dia inteiro quando o limite superior é uma data sem horário", async () => {
    findUserById.mockResolvedValueOnce(authUser(20, "admin"));
    findAll.mockResolvedValueOnce({ items: [], total: 0 });

    const response = await request(app)
      .get("/api/admin/projects?submitted_to=2026-09-30&updated_to=2026-09-30")
      .set("Authorization", `Bearer ${tokenFor(20)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        submittedTo: new Date("2026-09-30T23:59:59.999Z"),
        updatedTo: new Date("2026-09-30T23:59:59.999Z")
      })
    );
  });

  it("retorna histórico único e documentos por versão sem expor caminho interno", async () => {
    findUserById.mockResolvedValueOnce(authUser(30, "committee"));
    findAll.mockResolvedValueOnce({ items: [projectRecord()], total: 1 });

    const response = await request(app)
      .get("/api/admin/projects")
      .set("Authorization", `Bearer ${tokenFor(30)}`);

    expect(response.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: undefined }));
    expect(response.body).toEqual({
      items: [
        {
        id: 42,
        title: "Projeto de pesquisa",
        updated_at: "2026-09-25T12:00:00.000Z",
        status: [
          {
            code: "submitted_to_committee",
            label: "Enviado à comissão",
            version_number: 1,
            created_at: "2026-09-20T10:00:00.000Z",
            notes: null
          },
          {
            code: "needs_changes",
            label: "Precisa de alterações",
            version_number: 1,
            created_at: "2026-09-21T14:00:00.000Z",
            notes: "Complementar metodologia"
          }
        ],
        documents: [
          {
            id: 101,
            version_number: 1,
            document_type: "project_docx",
            original_filename: "projeto-v1.docx",
            created_at: "2026-09-20T10:00:00.000Z",
            download_url: "/api/admin/projects/42/documents/101/download"
          }
        ]
        }
      ],
      pagination: {
        page: 1,
        page_size: 20,
        total_items: 1,
        total_pages: 1
      }
    });
    expect(JSON.stringify(response.body)).not.toContain("storage_path");
    expect(JSON.stringify(response.body)).not.toContain("/segredo/interno");
  });

  it("limita filtros de documento da comissão aos tipos autorizados", async () => {
    findUserById.mockResolvedValueOnce(authUser(30, "committee"));

    const forbidden = await request(app)
      .get("/api/admin/projects?document_type=data_card")
      .set("Authorization", `Bearer ${tokenFor(30)}`);

    expect(forbidden.status).toBe(403);
    expect(findAll).not.toHaveBeenCalled();

    findUserById.mockResolvedValueOnce(authUser(30, "committee"));
    findAll.mockResolvedValueOnce({ items: [], total: 0 });

    const allowed = await request(app)
      .get("/api/admin/projects?has_document=true")
      .set("Authorization", `Bearer ${tokenFor(30)}`);

    expect(allowed.status).toBe(200);
    expect(findAll).toHaveBeenCalledWith(
      expect.objectContaining({ documentType: "project_docx", hasDocument: true })
    );
  });

  it("rejeita limites de paginação inseguros", async () => {
    findUserById.mockResolvedValueOnce(authUser(20, "admin"));
    const response = await request(app)
      .get("/api/admin/projects?page_size=101")
      .set("Authorization", `Bearer ${tokenFor(20)}`);
    expect(response.status).toBe(400);
    expect(findAll).not.toHaveBeenCalled();
  });
});

describe("GET /api/admin/projects/:projectId", () => {
  it("aplica o escopo do pesquisador também no acesso por URL", async () => {
    findUserById.mockResolvedValueOnce(authUser(10, "researcher"));
    findByProjectId.mockResolvedValueOnce(null);

    const response = await request(app)
      .get("/api/admin/projects/42")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(404);
    expect(findByProjectId).toHaveBeenCalledWith(42, 10);
  });

  it("permite que comissão consulte o detalhe", async () => {
    findUserById.mockResolvedValueOnce(authUser(30, "committee"));
    findByProjectId.mockResolvedValueOnce(projectRecord());

    const response = await request(app)
      .get("/api/admin/projects/42")
      .set("Authorization", `Bearer ${tokenFor(30)}`);

    expect(response.status).toBe(200);
    expect(findByProjectId).toHaveBeenCalledWith(42, undefined);
  });
});

describe("GET /api/admin/projects/:projectId/documents/:documentId/download", () => {
  const record = (documentType: string): DownloadRecord => ({
    id: 101,
    documentType,
    originalFilename: "projeto-v1.docx",
    storagePath: downloadPath,
    projectVersion: { versionNumber: 1 }
  });

  it.each([
    ["researcher" as const, 10, 10],
    ["admin" as const, 20, undefined],
    ["committee" as const, 30, undefined]
  ])("permite DOCX para %s", async (role, userId, expectedOwnerScope) => {
    await writeFile(downloadPath, "conteúdo-docx");
    findUserById.mockResolvedValueOnce(authUser(userId, role));
    findDocument.mockResolvedValueOnce(record("project_docx"));

    const response = await request(app)
      .get("/api/admin/projects/42/documents/101/download")
      .set("Authorization", `Bearer ${tokenFor(userId)}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toContain("projeto-v1.docx");
    expect(findDocument).toHaveBeenCalledWith(42, 101, expectedOwnerScope);
  });

  it("permite tipo adicional para admin", async () => {
    await writeFile(downloadPath, "data-card");
    findUserById.mockResolvedValueOnce(authUser(20, "admin"));
    findDocument.mockResolvedValueOnce(record("data_card"));

    const response = await request(app)
      .get("/api/admin/projects/42/documents/101/download")
      .set("Authorization", `Bearer ${tokenFor(20)}`);

    expect(response.status).toBe(200);
  });

  it.each(["researcher", "committee"] as const)("bloqueia tipo futuro para %s", async (role) => {
    const userId = role === "researcher" ? 10 : 30;
    findUserById.mockResolvedValueOnce(authUser(userId, role));
    findDocument.mockResolvedValueOnce(record("data_card"));

    const response = await request(app)
      .get("/api/admin/projects/42/documents/101/download")
      .set("Authorization", `Bearer ${tokenFor(userId)}`);

    expect(response.status).toBe(403);
  });

  it("não revela documento de outro pesquisador", async () => {
    findUserById.mockResolvedValueOnce(authUser(10, "researcher"));
    findDocument.mockResolvedValueOnce(null);

    const response = await request(app)
      .get("/api/admin/projects/99/documents/101/download")
      .set("Authorization", `Bearer ${tokenFor(10)}`);

    expect(response.status).toBe(404);
    expect(findDocument).toHaveBeenCalledWith(99, 101, 10);
  });

  it("não baixa arquivos fora do diretório de exports", async () => {
    findUserById.mockResolvedValueOnce(authUser(20, "admin"));
    findDocument.mockResolvedValueOnce({ ...record("data_card"), storagePath: "/etc/passwd" });

    const response = await request(app)
      .get("/api/admin/projects/42/documents/101/download")
      .set("Authorization", `Bearer ${tokenFor(20)}`);

    expect(response.status).toBe(404);
  });
});
