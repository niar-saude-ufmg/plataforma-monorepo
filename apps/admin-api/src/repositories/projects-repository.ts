import {
  Prisma,
  type evaluation_status as EvaluationStatus,
  type project_status as ProjectStatus,
  prisma
} from "@niar/database";
import type { UserRole } from "@niar/contracts";

const projectInclude = {
  owner: {
    select: {
      id: true,
      fullName: true,
      email: true
    }
  },
  versions: {
    orderBy: { versionNumber: "asc" as const },
    include: {
      statusHistory: { orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }] },
      documents: { orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }] },
      evaluations: {
        orderBy: [{ roundNumber: "desc" as const }, { id: "desc" as const }],
        include: {
          evaluatedBy: { select: { id: true, fullName: true, email: true, role: true } }
        }
      }
    }
  }
} satisfies Prisma.ProjectInclude;

export type ProjectRecord = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

export type ProjectListResult = {
  items: ProjectRecord[];
  total: number;
};

export type ProjectListFilter = {
  page: number;
  pageSize: number;
  currentUserId?: number;
  currentUserRole?: UserRole;
  ownerUserId?: number;
  status?: ProjectStatus;
  evaluationStatus?: "waiting" | EvaluationStatus;
  submittedFrom?: Date;
  submittedTo?: Date;
  updatedFrom?: Date;
  updatedTo?: Date;
  versionNumber?: number;
  documentType?: string;
  hasDocument?: boolean;
  search?: string;
  orderBy: "updated_at" | "submitted_at" | "title" | "id";
  orderDirection: "asc" | "desc";
};

const buildWhere = (filter: ProjectListFilter): Prisma.Sql => {
  const conditions: Prisma.Sql[] = [];
  const versionConditions: Prisma.Sql[] = [];

  if (filter.ownerUserId) conditions.push(Prisma.sql`p.owner_user_id = ${filter.ownerUserId}`);
  if (filter.updatedFrom) conditions.push(Prisma.sql`p.updated_at >= ${filter.updatedFrom}`);
  if (filter.updatedTo) conditions.push(Prisma.sql`p.updated_at <= ${filter.updatedTo}`);

  if (filter.status || filter.evaluationStatus) {
    versionConditions.push(Prisma.sql`NOT EXISTS (
      SELECT 1 FROM admin.project_versions newer
      WHERE newer.project_id = p.id AND newer.version_number > v.version_number
    )`);
  }
  if (filter.status) versionConditions.push(Prisma.sql`v.status::text = ${filter.status}`);
  if (filter.evaluationStatus === "waiting") {
    versionConditions.push(Prisma.sql`NOT EXISTS (
      SELECT 1 FROM admin.evaluations e WHERE e.project_version_id = v.id
    )`);
  } else if (filter.evaluationStatus) {
    versionConditions.push(Prisma.sql`(
      SELECT e.status::text FROM admin.evaluations e
      WHERE e.project_version_id = v.id ORDER BY e.round_number DESC LIMIT 1
    ) = ${filter.evaluationStatus}`);
  }
  if (filter.versionNumber) versionConditions.push(Prisma.sql`v.version_number = ${filter.versionNumber}`);
  if (filter.submittedFrom) versionConditions.push(Prisma.sql`v.submitted_at >= ${filter.submittedFrom}`);
  if (filter.submittedTo) versionConditions.push(Prisma.sql`v.submitted_at <= ${filter.submittedTo}`);
  if (filter.currentUserId && filter.currentUserRole === "committee") {
    versionConditions.push(Prisma.sql`v.submitted_at IS NOT NULL`);
  }
  if (filter.documentType || filter.hasDocument !== undefined) {
    const documents = Prisma.sql`SELECT 1 FROM admin.project_documents d
      WHERE d.project_version_id = v.id
      ${filter.documentType ? Prisma.sql`AND d.document_type = ${filter.documentType}` : Prisma.empty}`;
    versionConditions.push(filter.hasDocument === false
      ? Prisma.sql`NOT EXISTS (${documents})`
      : Prisma.sql`EXISTS (${documents})`);
  }
  if (versionConditions.length) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM admin.project_versions v
      WHERE v.project_id = p.id AND ${Prisma.join(versionConditions, " AND ")}
    )`);
  }

  if (filter.search) {
    const numericSearch = Number(filter.search);
    const textSearch = Prisma.sql`p.title ILIKE ${`%${filter.search}%`}`;
    conditions.push(Number.isSafeInteger(numericSearch) && numericSearch > 0
      ? Prisma.sql`(${textSearch} OR p.id = ${numericSearch} OR EXISTS (
          SELECT 1 FROM admin.project_versions searched
          WHERE searched.project_id = p.id
            AND (searched.id = ${numericSearch} OR searched.source_wizard_session_id = ${numericSearch})
        ))`
      : textSearch);
  }
  return conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;
};

export const projectsRepository = {
  findAll: async (filter: ProjectListFilter): Promise<ProjectListResult> => prisma.$transaction(async (transaction) => {
    const where = buildWhere(filter);
    const orderColumn = {
      updated_at: Prisma.sql`p.updated_at`,
      submitted_at: Prisma.sql`p.submitted_at`,
      title: Prisma.sql`p.title`,
      id: Prisma.sql`p.id`
    }[filter.orderBy];
    const direction = filter.orderDirection === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;
    const [page, counts] = await Promise.all([
      transaction.$queryRaw<{ id: number }[]>(Prisma.sql`
        SELECT p.id FROM admin.projects p ${where}
        ORDER BY ${orderColumn} ${direction}, p.id ASC
        LIMIT ${filter.pageSize} OFFSET ${(filter.page - 1) * filter.pageSize}
      `),
      transaction.$queryRaw<{ total: bigint }[]>(Prisma.sql`
        SELECT COUNT(*) AS total FROM admin.projects p ${where}
      `)
    ]);
    const total = Number(counts[0].total);
    if (page.length === 0) return { items: [], total };

    const records = await transaction.project.findMany({
      where: { id: { in: page.map((project) => project.id) } },
      include: projectInclude
    });
    // Os IDs e os registros foram lidos no mesmo snapshot da transação.
    const recordsById = new Map(records.map((record) => [record.id, record]));
    return { items: page.map(({ id }) => recordsById.get(id)!), total };
  }, { isolationLevel: "RepeatableRead" }),

  findById: (projectId: number, ownerUserId?: number): Promise<ProjectRecord | null> =>
    prisma.project.findFirst({
      where: { id: projectId, ...(ownerUserId ? { ownerUserId } : {}) },
      include: projectInclude
    }),

  findDocument: (projectId: number, documentId: number, ownerUserId?: number) =>
    prisma.projectDocument.findFirst({
      where: {
        id: documentId,
        projectVersion: {
          project: { id: projectId, ...(ownerUserId ? { ownerUserId } : {}) }
        }
      },
      select: {
        id: true,
        documentType: true,
        originalFilename: true,
        storagePath: true,
        projectVersion: { select: { versionNumber: true } }
      }
    })
};
