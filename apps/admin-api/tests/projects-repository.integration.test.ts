import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { randomUUID } from "node:crypto";

if (process.env.TEST_DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { prisma } = await import("@niar/database");
const { projectsRepository } = await import("../src/repositories/projects-repository.js");
const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;

integration("filtros e paginação de projetos no PostgreSQL", () => {
  let owner: number;
  let wizard: number;
  let project: number;
  const key = randomUUID();
  const submittedAt = new Date("2026-02-02T12:00:00Z");
  const filter = () => ({
    page: 1, pageSize: 10, ownerUserId: owner,
    orderBy: "id" as const, orderDirection: "asc" as const
  });

  beforeAll(async () => {
    owner = (await prisma.user.create({ data: {
      email: `${key}@example.org`, fullName: "Pesquisador", hashedPassword: "test", role: "researcher"
    } })).id;
    wizard = (await prisma.wizardSession.create({ data: {
      userId: owner, wizardType: "project_doc", currentStep: "project"
    } })).id;
    await prisma.$executeRaw`
      WITH inserted AS (
        INSERT INTO admin.projects(owner_user_id, title)
        SELECT ${owner}, 'Volume de paginação' FROM generate_series(1, 33000)
        RETURNING id
      )
      INSERT INTO admin.project_versions(project_id, version_number, source_wizard_session_id, status)
      SELECT id, 1, ${wizard}, 'submitted_for_review'::shared.project_status FROM inserted
    `;
    project = (await prisma.project.create({ data: {
      ownerUserId: owner, title: `Revisão ${key}`, versions: { create: [
        {
          sourceWizardSessionId: wizard, versionNumber: 1, status: "needs_changes", submittedAt: new Date("2026-01-02T12:00:00Z"),
          evaluations: { create: { status: "project_changes_requested" } },
          documents: { create: { documentType: "project_docx", originalFilename: "original.docx", storagePath: "/exports/original.docx" } }
        },
        {
          sourceWizardSessionId: wizard, versionNumber: 2, status: "under_review", submittedAt,
          evaluations: { create: { status: "to_review" } }
        }
      ] }
    } })).id;
  });

  afterAll(async () => {
    try {
      if (owner) {
        await prisma.project.deleteMany({ where: { ownerUserId: owner } });
        await prisma.wizardSession.deleteMany({ where: { userId: owner } });
        await prisma.user.delete({ where: { id: owner } });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  it("pagina mais de 32 mil projetos sem exceder os parâmetros do PostgreSQL", async () => {
    const result = await projectsRepository.findAll({ ...filter(), evaluationStatus: "waiting" });
    expect(result.total).toBe(33000);
    expect(result.items).toHaveLength(10);
    expect(result.items.map((item) => item.id)).toEqual([...result.items.map((item) => item.id)].sort((a, b) => a - b));
    const next = await projectsRepository.findAll({ ...filter(), page: 2, evaluationStatus: "waiting" });
    expect(next.total).toBe(33000);
    expect(next.items).toHaveLength(10);
    expect(next.items[0].id).toBeGreaterThan(result.items.at(-1)!.id);
    const empty = await projectsRepository.findAll({ ...filter(), page: 3301, evaluationStatus: "waiting" });
    expect(empty).toEqual({ items: [], total: 33000 });
  });

  it.each([
    [{ status: "under_review" as const }, 1],
    [{ status: "needs_changes" as const }, 0],
    [{ evaluationStatus: "to_review" as const }, 1],
    [{ evaluationStatus: "project_changes_requested" as const }, 0],
    [{ evaluationStatus: "waiting" as const }, 0],
    [{ versionNumber: 1 }, 1],
    [{ versionNumber: 1, status: "under_review" as const }, 0],
    [{ documentType: "project_docx" }, 1],
    [{ documentType: "project_docx", status: "under_review" as const }, 0],
    [{ documentType: "project_docx", hasDocument: false, status: "under_review" as const }, 1],
    [{ hasDocument: false, status: "under_review" as const }, 1],
    [{ hasDocument: true, status: "under_review" as const }, 0],
    [{ submittedFrom: new Date("2026-02-01"), status: "under_review" as const }, 1],
    [{ submittedTo: new Date("2026-01-31"), status: "under_review" as const }, 0],
    [{ updatedFrom: new Date("2100-01-01") }, 0],
    [{ updatedTo: new Date("2000-01-01") }, 0],
  ])("combina filtros na versão correta: %j", async (extra, expected) => {
    const result = await projectsRepository.findAll({ ...filter(), search: `Revisão ${key}`, ...extra });
    expect(result.total).toBe(expected);
    expect(result.items.map((item) => item.id)).toEqual(expected ? [project] : []);
  });

  it("mantém o escopo do proprietário e a visibilidade do Comitê", async () => {
    const committee = await projectsRepository.findAll({ ...filter(), currentUserId: owner, currentUserRole: "committee" });
    expect(committee.total).toBe(1);
    expect(committee.items[0].id).toBe(project);
    const foreign = await projectsRepository.findAll({ ...filter(), ownerUserId: -1, search: key });
    expect(foreign).toEqual({ items: [], total: 0 });
  });
});
