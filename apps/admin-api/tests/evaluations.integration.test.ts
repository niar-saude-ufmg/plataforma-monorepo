import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.SECRET_KEY ??= "integration-test-secret";

// Run only against an explicitly supplied, disposable database initialized with 001_base.sql.
if (process.env.TEST_DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { prisma } = await import("@niar/database");
const { evaluationsRepository: repository } = await import("../src/repositories/evaluations-repository.js");
const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;

integration("avaliações e entregas no PostgreSQL", () => {
  let exportsDirectory: string;
  let outsideDirectory: string;
  const previousExportsDirectory = process.env.EXPORTS_DIR;
  beforeAll(async () => {
    exportsDirectory = await mkdtemp(join(tmpdir(), "niar-report-exports-"));
    outsideDirectory = await mkdtemp(join(tmpdir(), "niar-report-outside-"));
    process.env.EXPORTS_DIR = exportsDirectory;
  });
  let owner: number, admin: number, committee: number, other: number, version: number, wizard: number, project: number;
  beforeEach(async () => {
    const key = randomUUID();
    const users = await Promise.all((["researcher", "admin", "committee", "committee"] as const).map((role, index) =>
      prisma.user.create({ data: { email: `${key}-${index}@example.org`, fullName: role, hashedPassword: "test", role, accountStatus: "active" } })));
    [owner, admin, committee, other] = users.map((user) => user.id);
    const specialty = await prisma.specialty.create({ data: { code: key, name: key, nameNormalized: key } });
    await prisma.committeeMemberProfile.createMany({ data: [committee, other].map((userId) => ({ userId, specialtyId: specialty.id })) });
    wizard = (await prisma.wizardSession.create({ data: { userId: owner, wizardType: "project_doc", currentStep: "project" } })).id;
    const created = await prisma.project.create({ data: {
      ownerUserId: owner, title: "Projeto", versions: { create: {
        versionNumber: 1, sourceWizardSessionId: wizard, status: "submitted_for_review", submittedAt: new Date(), characterizationSnapshot: { original: true }
      } }
    }, include: { versions: true } });
    project = created.id;
    version = created.versions[0].id;
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await Promise.all([rm(exportsDirectory, { recursive: true, force: true }), rm(outsideDirectory, { recursive: true, force: true })]);
    if (previousExportsDirectory === undefined) delete process.env.EXPORTS_DIR;
    else process.env.EXPORTS_DIR = previousExportsDirectory;
  });

  const assign = () => repository.assign({ projectVersionId: version, assignedToUserId: committee, actorUserId: committee, actorRole: "committee", ipAddress: "" });
  const decision = async (status: Parameters<typeof repository.decide>[0]["status"], extra = {}) => repository.decide({
    evaluationId: (await repository.findByProjectVersionId(version)).id,
    projectVersionId: version, actorUserId: committee, status, justification: "Parecer humano", ipAddress: "", ...extra
  });
  const artifact = async (type = "report", sessionId = wizard) => {
    const filename = `${randomUUID()}.pdf`;
    const filePath = join(exportsDirectory, filename);
    await writeFile(filePath, `%PDF-1.4\nEntrega ${filename}`);
    return prisma.exportArtifact.create({ data: { sessionId, filename, filePath, artifactType: type } });
  };
  const receive = (delivery: number, ids: number[], extra = {}) => repository.receiveReport({
    projectVersionId: version, actorUserId: owner, actorRole: "researcher", ipAddress: "", deliveryNumber: delivery,
    documents: ids.map((id) => ({ sourceExportArtifactId: id })), ...extra
  });
  const safeRoom = async () => {
    await assign();
    await decision("project_approved");
    await prisma.projectVersion.update({ where: { id: version }, data: { status: "under_safe_room" } });
  };

  it("serializa autoatribuições concorrentes e impede tomar a avaliação de outro membro", async () => {
    const { projectsRepository } = await import("../src/repositories/projects-repository.js");
    const queue = await projectsRepository.findAll({ page: 1, pageSize: 20, ownerUserId: owner,
      currentUserId: committee, currentUserRole: "committee", evaluationStatus: "waiting", orderBy: "id", orderDirection: "asc" });
    expect(queue.items).toHaveLength(1);
    const results = await Promise.allSettled([assign(), repository.assign({ projectVersionId: version, assignedToUserId: other, actorUserId: admin, actorRole: "admin", ipAddress: "" })]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.find((result) => result.status === "rejected")).toMatchObject({ reason: { statusCode: 409 } });
    expect(await prisma.evaluation.count({ where: { projectVersionId: version } })).toBe(1);
    const assigned = await repository.findByProjectVersionId(version);
    await expect(repository.decide({ projectVersionId: version, actorUserId: assigned.assignedToUserId === committee ? other : committee, status: "project_changes_requested", justification: "Ajustes", ipAddress: "" })).rejects.toMatchObject({ statusCode: 403 });
    expect(await prisma.auditLog.count({ where: { action: "assign_evaluation", resourceId: String(assigned.id) } })).toBe(1);
  });

  it("registra a solicitação com parecer imutável, histórico e proteção para decisões repetidas", async () => {
    const initial = await assign();
    const results = await Promise.allSettled([decision("project_changes_requested"), decision("project_changes_requested")]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.find((result) => result.status === "rejected")).toMatchObject({ reason: { statusCode: 409 } });
    const updated = await repository.findByProjectVersionId(version);
    expect(updated).toMatchObject({ status: "project_changes_requested", roundNumber: 2, deliveryNumber: 0 });
    expect(await prisma.evaluation.findUnique({ where: { id: initial.id } })).toMatchObject({ status: "to_review", evaluatedAt: null });
    expect(await prisma.projectVersion.findUnique({ where: { id: version } })).toMatchObject({ status: "needs_changes" });
    expect(await prisma.projectStatusHistory.findFirst({ where: { evaluationId: updated.id } })).toMatchObject({ status: "needs_changes" });
  });

  it("preserva duas entregas, todos os pareceres e o Comitê na mesma versão", async () => {
    await safeRoom();
    const report1 = await artifact();
    const concurrent = await Promise.allSettled([receive(1, [report1.id]), receive(1, [report1.id])]);
    expect(concurrent.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(concurrent.find((result) => result.status === "rejected")).toMatchObject({ reason: { statusCode: 409 } });
    const firstOpinion = await decision("report_changes_requested");
    const report2 = await artifact();
    const next = await receive(2, [report2.id]);
    expect(next).toMatchObject({ assignedToUserId: committee, committeeMemberUserId: committee, deliveryNumber: 2, status: "to_review" });
    await expect(receive(2, [report2.id])).rejects.toMatchObject({ statusCode: 409 });
    await expect(decision("report_approved", { evaluationId: firstOpinion.id, certificationDecision: "granted" })).rejects.toMatchObject({ statusCode: 409 });
    const final = await decision("report_approved", { certificationDecision: "granted" });
    expect(final).toMatchObject({ certificationDecision: "granted", deliveryNumber: 2, assignedToUserId: committee });
    expect(await prisma.evaluation.findUnique({ where: { id: firstOpinion.id } })).toMatchObject({ status: "report_changes_requested", deliveryNumber: 1 });
    expect(await prisma.projectVersion.count({ where: { projectId: project } })).toBe(1);
    expect(await prisma.projectDocument.findMany({ where: { projectVersionId: version }, orderBy: { deliveryNumber: "asc" } })).toMatchObject([
      { deliveryNumber: 1, sourceExportArtifactId: report1.id }, { deliveryNumber: 2, sourceExportArtifactId: report2.id }
    ]);
    expect(await prisma.projectVersion.findUnique({ where: { id: version } })).toMatchObject({ characterizationSnapshot: { original: true } });
  });

  it("rejeita certificação fora da aprovação humana e to_review não é decisão", async () => {
    await assign();
    await expect(decision("project_changes_requested", { certificationDecision: "not_granted" })).rejects.toMatchObject({ statusCode: 400 });
    expect(await prisma.evaluation.count({ where: { projectVersionId: version } })).toBe(1);
    const { updateEvaluationSchema } = await import("../src/schemas/evaluation-schema.js");
    expect(updateEvaluationSchema.safeParse({ status: "to_review" }).success).toBe(false);
  });

  it.each([{}, { certificationDecision: "not_granted" as const }, { certificationDecision: "not_granted" as const, certificationReason: "   " }])(
    "rejeita certificação incompleta no domínio sem consumir a rodada: %j", async (certification) => {
      await safeRoom();
      const report = await artifact();
      const pending = await receive(1, [report.id]);
      const historyCount = await prisma.projectStatusHistory.count({ where: { projectVersionId: version } });
      await expect(decision("report_approved", certification)).rejects.toMatchObject({ statusCode: 400 });
      expect(await repository.findByProjectVersionId(version)).toMatchObject({ id: pending.id, status: "to_review" });
      expect(await prisma.evaluation.count({ where: { projectVersionId: version } })).toBe(3);
      expect(await prisma.projectStatusHistory.count({ where: { projectVersionId: version } })).toBe(historyCount);
      expect(await prisma.projectVersion.findUnique({ where: { id: version } })).toMatchObject({ status: "report_under_review" });
    }
  );

  it("registra a decisão humana sem selo e preserva o relatório e o parecer pendente", async () => {
    await safeRoom();
    const report = await artifact();
    const pending = await receive(1, [report.id]);
    const { app } = await import("../src/app.js");
    const response = await request(app).put(`/api/admin/project-versions/${version}/evaluation`)
      .set("Authorization", `Bearer ${jwt.sign({ sub: String(committee) }, process.env.SECRET_KEY!)}`)
      .send({ status: "report_approved", evaluation_id: pending.id, certification_decision: "not_granted", certification_reason: "Critérios do selo não atendidos" });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "report_approved", delivery_number: 1, certification_decision: "not_granted", certification_reason: "Critérios do selo não atendidos" });
    expect(await prisma.evaluation.findUnique({ where: { id: pending.id } })).toMatchObject({ status: "to_review", certificationDecision: null });
    expect(await prisma.projectDocument.count({ where: { projectVersionId: version } })).toBe(1);
  });

  it("faz rollback de todos os documentos quando uma definição de questionário é inválida", async () => {
    await safeRoom();
    const report = await artifact();
    const questionnaire = await artifact("filled_questionnaire");
    await expect(receive(1, [report.id, questionnaire.id])).rejects.toMatchObject({ statusCode: 400 });
    expect(await prisma.projectDocument.count({ where: { projectVersionId: version } })).toBe(0);
    expect(await prisma.evaluation.count({ where: { projectVersionId: version } })).toBe(2);
    expect(await prisma.projectVersion.findUnique({ where: { id: version } })).toMatchObject({ status: "under_safe_room" });
  });

  it("vincula o artefato preenchido à definição publicada exata, mesmo inativa", async () => {
    await safeRoom();
    const definition = await prisma.questionnaire.create({ data: { questionnaireKey: randomUUID(), version: 3, title: "FIAR", publishedAt: new Date() } });
    const filled = await artifact("filled_questionnaire");
    await prisma.exportArtifact.update({ where: { id: filled.id }, data: { questionnaireId: definition.id } });
    await receive(1, [filled.id]);
    expect(await prisma.projectDocument.findFirst({ where: { sourceExportArtifactId: filled.id } })).toMatchObject({ questionnaireId: definition.id });
  });

  it("bloqueia entrega de outro proprietário e artefatos de outra sessão", async () => {
    await safeRoom();
    const report = await artifact();
    await expect(receive(1, [report.id], { actorUserId: other })).rejects.toMatchObject({ statusCode: 403 });
    const foreign = await prisma.wizardSession.create({ data: { userId: owner, wizardType: "project_doc", currentStep: "project" } });
    const foreignReport = await artifact("report", foreign.id);
    await expect(receive(1, [foreignReport.id])).rejects.toMatchObject({ statusCode: 400 });
    expect(await prisma.projectDocument.count({ where: { projectVersionId: version } })).toBe(0);
  });

  it.each(["project_doc", "data_clean"] as const)("valida o tipo da sessão vinculada ao receber relatório: %s", async (wizardType) => {
    await safeRoom();
    const linked = await prisma.wizardSession.create({ data: { userId: owner, wizardType, currentStep: "export", linkedProjectId: wizard } });
    const report = await artifact("report", linked.id);
    if (wizardType === "data_clean") {
      expect(await receive(1, [report.id])).toMatchObject({ status: "to_review", deliveryNumber: 1, assignedToUserId: committee });
      expect(await prisma.projectDocument.count({ where: { projectVersionId: version } })).toBe(1);
    } else {
      await expect(receive(1, [report.id])).rejects.toMatchObject({ statusCode: 400 });
      expect(await prisma.projectDocument.count({ where: { projectVersionId: version } })).toBe(0);
    }
  });

  it("bloqueia decisões e atribuições de versões antigas", async () => {
    await assign();
    await prisma.projectVersion.create({ data: { projectId: project, versionNumber: 2, sourceWizardSessionId: wizard, status: "resubmitted_for_review" } });
    await expect(decision("project_changes_requested")).rejects.toMatchObject({ statusCode: 409 });
    await expect(assign()).rejects.toMatchObject({ statusCode: 409 });
  });
  it("filtra pelo parecer atual e mantém os pareceres anteriores na consulta do projeto", async () => {
    await assign();
    await decision("project_changes_requested");
    const { projectsRepository } = await import("../src/repositories/projects-repository.js");
    const filter = { page: 1, pageSize: 20, ownerUserId: owner, currentUserId: admin, currentUserRole: "admin" as const, orderBy: "id" as const, orderDirection: "asc" as const };
    expect((await projectsRepository.findAll({ ...filter, evaluationStatus: "to_review" })).items).toHaveLength(0);
    expect((await projectsRepository.findAll({ ...filter, evaluationStatus: "project_changes_requested" })).items).toHaveLength(1);
    const { projectsService } = await import("../src/services/projects-service.js");
    const response = await projectsService.getProject(project, { id: admin, role: "admin", email: "admin@example.org", fullName: "Admin", accountStatus: "active" });
    expect(response.evaluations?.map((evaluation) => evaluation.status)).toEqual(["to_review", "project_changes_requested"]);
    expect(response.current_version).toMatchObject({ id: version, status: "needs_changes" });
    expect(response.versions[0].characterization_snapshot).toEqual({ original: true });
    const researcher = await projectsService.getProject(project, { id: owner, role: "researcher", email: "owner@example.org", fullName: "Owner", accountStatus: "active" });
    expect(researcher).not.toHaveProperty("evaluation_status");
    expect(researcher).not.toHaveProperty("evaluations");
    await prisma.projectVersion.create({ data: { projectId: project, versionNumber: 2, sourceWizardSessionId: wizard, status: "resubmitted_for_review" } });
    expect((await projectsRepository.findAll({ ...filter, status: "needs_changes" })).items).toHaveLength(0);
    expect((await projectsRepository.findAll({ ...filter, evaluationStatus: "waiting" })).items).toHaveLength(1);
  });

  it.each(["ausente", "fora de exports", "diretório", "symlink externo"])("rejeita arquivo %s antes de registrar entrega ou parecer", async (scenario) => {
    await safeRoom();
    const report = await artifact();
    let invalidPath = report.filePath;
    if (scenario === "ausente") await unlink(report.filePath);
    else if (scenario === "diretório") {
      invalidPath = join(exportsDirectory, randomUUID());
      await mkdir(invalidPath);
    } else {
      const externalPath = join(outsideDirectory, `${randomUUID()}.pdf`);
      await writeFile(externalPath, "%PDF-1.4 externo");
      if (scenario === "fora de exports") invalidPath = externalPath;
      else {
        invalidPath = join(exportsDirectory, `${randomUUID()}.pdf`);
        await symlink(externalPath, invalidPath);
      }
    }
    await prisma.exportArtifact.update({ where: { id: report.id }, data: { filePath: invalidPath } });
    const historyCount = await prisma.projectStatusHistory.count({ where: { projectVersionId: version } });
    const auditCount = await prisma.auditLog.count({ where: { userId: owner, action: "receive_project_report" } });
    const { app } = await import("../src/app.js");
    const response = await request(app).post(`/api/admin/project-versions/${version}/report-deliveries`)
      .set("Authorization", `Bearer ${jwt.sign({ sub: String(owner) }, process.env.SECRET_KEY!)}`)
      .send({ delivery_number: 1, documents: [{ source_export_artifact_id: report.id }] });
    expect(response.status).toBe(400);
    expect(await prisma.projectDocument.count({ where: { projectVersionId: version } })).toBe(0);
    expect(await prisma.evaluation.count({ where: { projectVersionId: version } })).toBe(2);
    expect(await prisma.projectStatusHistory.count({ where: { projectVersionId: version } })).toBe(historyCount);
    expect(await prisma.auditLog.count({ where: { userId: owner, action: "receive_project_report" } })).toBe(auditCount);
    expect(await prisma.projectVersion.findUnique({ where: { id: version } })).toMatchObject({ status: "under_safe_room" });
    if (scenario === "ausente") {
      await writeFile(report.filePath, "%PDF-1.4 recuperado");
      await receive(1, [report.id]);
      const document = await prisma.projectDocument.findFirstOrThrow({ where: { sourceExportArtifactId: report.id } });
      expect(await readFile(document.storagePath, "utf8")).toBe("%PDF-1.4 recuperado");
    }
  });

  it("rejeita duas referências ao mesmo arquivo físico", async () => {
    await safeRoom();
    const first = await artifact();
    const second = await artifact();
    const alias = join(exportsDirectory, `${randomUUID()}.pdf`);
    await symlink(first.filePath, alias);
    await prisma.exportArtifact.update({ where: { id: second.id }, data: { filePath: alias } });
    await expect(receive(1, [first.id, second.id])).rejects.toMatchObject({ statusCode: 400 });
    expect(await prisma.projectDocument.count({ where: { projectVersionId: version } })).toBe(0);
  });

});
