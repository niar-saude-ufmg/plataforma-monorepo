import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { createRequire } from "node:module";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";

process.env.SECRET_KEY ??= "integration-test-secret";
if (process.env.TEST_DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { prisma } = await import("@niar/database");
const { Client } = createRequire(new URL("../../../packages/database/package.json", import.meta.url))("pg");
const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;

integration("compatibilidade de pareceres antigos", () => {
  let exportsDirectory: string;
  const previousExportsDirectory = process.env.EXPORTS_DIR;
  beforeAll(async () => {
    exportsDirectory = await mkdtemp(join(tmpdir(), "niar-legacy-exports-"));
    process.env.EXPORTS_DIR = exportsDirectory;
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await rm(exportsDirectory, { recursive: true, force: true });
    if (previousExportsDirectory === undefined) delete process.env.EXPORTS_DIR;
    else process.env.EXPORTS_DIR = previousExportsDirectory;
  });
  const authorization = (id: number) => `Bearer ${jwt.sign({ sub: String(id) }, process.env.SECRET_KEY!)}`;

  it("reaplica o SQL e preserva IDs, status, justificativas, documentos e vínculos de histórico", async () => {
    const connection = new Client({ connectionString: process.env.TEST_DATABASE_URL });
    await connection.connect();
    try {
      const key = randomUUID();
      const user = await prisma.user.create({ data: {
        email: `${key}@example.org`, fullName: "Membro histórico", hashedPassword: "test", role: "committee", accountStatus: "active"
      } });
      const auditor = await prisma.user.create({ data: {
        email: `${key}-auditor@example.org`, fullName: "Auditor histórico", hashedPassword: await hash("LegacyPassword123!", 4),
        role: "auditor", accountStatus: "active"
      } });
      const wizard = await prisma.wizardSession.create({ data: { userId: user.id, wizardType: "project_doc", currentStep: "project" } });
      const project = await prisma.project.create({ data: { ownerUserId: user.id, title: "Projeto histórico", versions: { create: {
        versionNumber: 1, sourceWizardSessionId: wizard.id, status: "needs_changes", characterizationSnapshot: { title: "Snapshot original" },
        documents: { create: { documentType: "project_docx", originalFilename: "original.docx", storagePath: "/exports/original.docx" } }
      } } }, include: { versions: true } });
      const version = project.versions[0];
      const statuses = ["sent_to_committee", "approved_by_committee", "rejected_by_committee", "needs_changes_by_committee", "approved", "rejected", "needs_changes"];
      const original: { id: number; status: string; justification: string; created_at: Date }[] = [];
      for (const [index, status] of statuses.entries()) {
        const inserted = await connection.query(`
          INSERT INTO admin.evaluations(project_version_id, round_number, status, justification, assigned_to_user_id, evaluated_by_user_id, assigned_by_user_id, created_at)
          VALUES ($1, $2, $3::admin.evaluation_status, $4, $5, $5, $6, '2026-01-01T12:00:00Z')
          RETURNING id, status::text AS status, justification, created_at
        `, [version.id, index + 1, status, `Parecer original ${index}`, auditor.id, user.id]);
        original.push(inserted.rows[0]);
        await prisma.projectStatusHistory.create({ data: {
          projectVersionId: version.id, status: "needs_changes", evaluationId: inserted.rows[0].id, notes: `Histórico ${index}`
        } });
      }
      // Simula registros existentes antes do preenchimento da numeração de rodadas.
      await connection.query("ALTER TABLE admin.evaluations ALTER COLUMN round_number DROP NOT NULL");
      await connection.query("UPDATE admin.evaluations SET round_number = NULL WHERE project_version_id = $1", [version.id]);
      const sql = await readFile(new URL("../../../packages/database/sql/001_base.sql", import.meta.url), "utf8");
      await connection.query(sql);
      await connection.query(sql);

      const evaluations = await prisma.evaluation.findMany({ where: { projectVersionId: version.id }, orderBy: { roundNumber: "asc" } });
      expect(evaluations.map((row) => ({ id: row.id, status: row.status, justification: row.justification, created_at: row.createdAt }))).toEqual(original);
      expect(evaluations.map((row) => row.roundNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      const preserved = await prisma.projectVersion.findUniqueOrThrow({ where: { id: version.id }, include: { documents: true, statusHistory: true } });
      expect(preserved.characterizationSnapshot).toEqual({ title: "Snapshot original" });
      expect(preserved.documents).toHaveLength(1);
      expect(preserved.documents[0]).toMatchObject({ originalFilename: "original.docx", storagePath: "/exports/original.docx" });
      expect(preserved.statusHistory.map((row) => row.evaluationId).sort()).toEqual(original.map((row) => row.id).sort());
      const { evaluationsRepository } = await import("../src/repositories/evaluations-repository.js");
      expect(await evaluationsRepository.findByProjectVersionId(version.id)).toMatchObject({ status: "needs_changes", roundNumber: 7 });
      const { app } = await import("../src/app.js");
      const evaluationResponse = await request(app).get(`/api/admin/project-versions/${version.id}/evaluation`).set("Authorization", authorization(user.id));
      expect(evaluationResponse.status).toBe(200);
      expect(evaluationResponse.body.evaluated_by).toMatchObject({ user_id: auditor.id, role: "auditor" });
      const projectResponse = await request(app).get(`/api/admin/projects/${project.id}`).set("Authorization", authorization(user.id));
      expect(projectResponse.status).toBe(200);
      expect(projectResponse.body.evaluations).toHaveLength(statuses.length);
      expect((await request(app).get("/api/admin/auth/me").set("Authorization", authorization(auditor.id))).status).toBe(401);
      expect((await request(app).post("/api/admin/auth/login").send({ email: auditor.email, password: "LegacyPassword123!" })).status).toBe(403);
    } finally {
      await connection.end();
    }
  });

  it.each(["to_review", "needs_changes", "needs_changes_by_committee"])(
    "migra a entrega pós-sala segura %s e permite sua continuidade sem perder arquivos", async (status) => {
      const connection = new Client({ connectionString: process.env.TEST_DATABASE_URL });
      await connection.connect();
      try {
        const key = randomUUID();
        const owner = await prisma.user.create({ data: { email: `${key}-owner@example.org`, fullName: "Pesquisador", hashedPassword: "test", role: "researcher", accountStatus: "active" } });
        const member = await prisma.user.create({ data: { email: `${key}-member@example.org`, fullName: "Comitê", hashedPassword: "test", role: "committee", accountStatus: "active" } });
        const wizard = await prisma.wizardSession.create({ data: { userId: owner.id, wizardType: "project_doc", currentStep: "project" } });
        const originalPath = join(exportsDirectory, `${key}-original.pdf`);
        await writeFile(originalPath, "Relatório original");
        const project = await prisma.project.create({ data: {
          ownerUserId: owner.id, title: "Entrega legada", versions: { create: {
            versionNumber: 1, sourceWizardSessionId: wizard.id,
            status: status === "needs_changes" ? "needs_changes" : "under_review",
            documents: { create: [
              { documentType: "project_docx", originalFilename: "project.docx", storagePath: join(exportsDirectory, `${key}.docx`) },
              { documentType: "report", originalFilename: "original.pdf", storagePath: originalPath }
            ] }
          } }
        }, include: { versions: { include: { documents: true } } } });
        const version = project.versions[0];
        // A coluna existia antes da numeração de entregas e permanece apenas nos bancos migrados.
        await connection.query("ALTER TABLE admin.evaluations ADD COLUMN IF NOT EXISTS evaluation_context TEXT NOT NULL DEFAULT 'pre_safe_room'");
        const result = await connection.query(`
          INSERT INTO admin.evaluations(project_version_id, status, assigned_to_user_id, evaluation_context, justification)
          VALUES ($1, $2::admin.evaluation_status, $3, 'post_safe_room', 'Parecer legado') RETURNING id
        `, [version.id, status, member.id]);
        const originalId = result.rows[0].id;
        const sql = await readFile(new URL("../../../packages/database/sql/001_base.sql", import.meta.url), "utf8");
        await connection.query(sql);
        await connection.query(sql);
        expect(await prisma.evaluation.findUnique({ where: { id: originalId } })).toMatchObject({ status, deliveryNumber: 1, committeeMemberUserId: member.id, justification: "Parecer legado" });
        const documents = await prisma.projectDocument.findMany({ where: { projectVersionId: version.id } });
        expect(documents.find((doc) => doc.documentType === "project_docx")?.deliveryNumber).toBe(0);
        expect(documents.find((doc) => doc.documentType === "report")?.deliveryNumber).toBe(1);
        const { app } = await import("../src/app.js");
        if (status === "to_review") {
          expect(await prisma.projectVersion.findUnique({ where: { id: version.id } })).toMatchObject({ status: "report_under_review" });
          const response = await request(app).put(`/api/admin/project-versions/${version.id}/evaluation`)
            .set("Authorization", authorization(member.id)).send({ status: "report_changes_requested", evaluation_id: originalId, justification: "Ajustar relatório" });
          expect(response.status).toBe(200);
        } else {
          expect(await prisma.projectVersion.findUnique({ where: { id: version.id } })).toMatchObject({ status: "safe_room_reuse_requested" });
        }
        const filePath = join(exportsDirectory, `${key}-new.pdf`);
        await writeFile(filePath, "Relatório revisado");
        const artifact = await prisma.exportArtifact.create({ data: { sessionId: wizard.id, filename: "new.pdf", filePath, artifactType: "report" } });
        const receipt = await request(app).post(`/api/admin/project-versions/${version.id}/report-deliveries`)
          .set("Authorization", authorization(owner.id)).send({ delivery_number: 2, documents: [{ source_export_artifact_id: artifact.id }] });
        expect(receipt.status).toBe(201);
        const evaluations = await prisma.evaluation.findMany({ where: { projectVersionId: version.id }, orderBy: { roundNumber: "desc" } });
        expect(evaluations[0]).toMatchObject({ status: "to_review", deliveryNumber: 2, assignedToUserId: member.id });
        expect(evaluations.find((row) => row.id === originalId)).toMatchObject({ status, justification: "Parecer legado" });
        expect(await prisma.projectVersion.count({ where: { projectId: project.id } })).toBe(1);
        expect(await prisma.projectDocument.count({ where: { projectVersionId: version.id } })).toBe(3);
        expect(await readFile(originalPath, "utf8")).toBe("Relatório original");
      } finally {
        await connection.end();
      }
    }
  );
});
