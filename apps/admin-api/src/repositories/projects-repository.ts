import {
  Prisma,
  type evaluation_context as EvaluationContext,
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
      statusHistory: { orderBy: { createdAt: "asc" as const } },
      documents: { orderBy: { createdAt: "asc" as const } },
      evaluations: {
        orderBy: [{ updatedAt: "desc" as const }, { id: "desc" as const }],
        include: {
          assignedTo: { select: { id: true, fullName: true, email: true, role: true } },
          assignedBy: { select: { id: true, fullName: true, email: true, role: true } },
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
  evaluationContext?: EvaluationContext;
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

const POST_SAFE_ROOM_STATUSES: ProjectStatus[] = [
  "under_safe_room",
  "report_submitted",
  "report_under_review",
  "safe_room_reuse_requested",
  "rescheduled_for_safe_room",
  "reapproved_for_safe_room",
  "report_resubmitted"
];

const visibilityVersionWhere = (
  role: UserRole | undefined,
  userId: number | undefined
): Prisma.ProjectVersionWhereInput | undefined => {
  if (!userId || role === "admin" || role === "researcher") return undefined;

  if (role === "auditor") {
    return {
      status: { notIn: POST_SAFE_ROOM_STATUSES },
      OR: [
        { evaluations: { none: {} } },
        {
          evaluations: {
            some: {
              context: "pre_safe_room",
              OR: [{ assignedToUserId: userId }, { assignedByUserId: userId }]
            }
          }
        }
      ]
    };
  }

  if (role === "committee") {
    return {
      OR: [
        { status: { in: POST_SAFE_ROOM_STATUSES } },
        { evaluations: { some: { context: "post_safe_room" } } },
        {
          evaluations: {
            some: {
              context: "pre_safe_room",
              assignedToUserId: userId
            }
          }
        }
      ]
    };
  }

  return undefined;
};

const buildWhere = (filter: Omit<ProjectListFilter, "page" | "pageSize" | "orderBy" | "orderDirection">) => {
  const versionWhere: Prisma.ProjectVersionWhereInput = {};

  if (filter.status) versionWhere.status = filter.status;
  if (filter.evaluationStatus === "waiting") {
    versionWhere.evaluations = { none: {} };
  } else if (filter.evaluationStatus || filter.evaluationContext) {
    versionWhere.evaluations = {
      some: {
        ...(filter.evaluationContext ? { context: filter.evaluationContext } : {}),
        ...(filter.evaluationStatus ? { status: filter.evaluationStatus } : {})
      }
    };
  }
  if (filter.versionNumber) versionWhere.versionNumber = filter.versionNumber;
  if (filter.submittedFrom || filter.submittedTo) {
    versionWhere.submittedAt = {
      ...(filter.submittedFrom ? { gte: filter.submittedFrom } : {}),
      ...(filter.submittedTo ? { lte: filter.submittedTo } : {})
    };
  }
  if (filter.hasDocument === false) {
    versionWhere.documents = {
      none: filter.documentType ? { documentType: filter.documentType } : {}
    };
  } else if (filter.documentType || filter.hasDocument === true) {
    versionWhere.documents = {
      some: filter.documentType ? { documentType: filter.documentType } : {}
    };
  }

  const visibilityWhere = visibilityVersionWhere(filter.currentUserRole, filter.currentUserId);
  if (visibilityWhere) {
    const existingAnd = versionWhere.AND;
    versionWhere.AND = [
      ...(Array.isArray(existingAnd) ? existingAnd : existingAnd ? [existingAnd] : []),
      visibilityWhere
    ];
  }

  const where: Prisma.ProjectWhereInput = {
    ...(filter.ownerUserId ? { ownerUserId: filter.ownerUserId } : {}),
    ...(filter.updatedFrom || filter.updatedTo
      ? {
          updatedAt: {
            ...(filter.updatedFrom ? { gte: filter.updatedFrom } : {}),
            ...(filter.updatedTo ? { lte: filter.updatedTo } : {})
          }
        }
      : {}),
    ...(Object.keys(versionWhere).length > 0 ? { versions: { some: versionWhere } } : {})
  };

  if (filter.search) {
    const numericSearch = Number(filter.search);
    where.OR = [
      { title: { contains: filter.search, mode: "insensitive" } },
      ...(Number.isSafeInteger(numericSearch) && numericSearch > 0
        ? [
            { id: numericSearch },
            { versions: { some: { id: numericSearch } } },
            { versions: { some: { sourceWizardSessionId: numericSearch } } }
          ]
        : [])
    ];
  }

  return where;
};

const buildOrderBy = (
  field: ProjectListFilter["orderBy"],
  direction: ProjectListFilter["orderDirection"]
): Prisma.ProjectOrderByWithRelationInput => {
  const prismaField = {
    updated_at: "updatedAt",
    submitted_at: "submittedAt",
    title: "title",
    id: "id"
  }[field] as "updatedAt" | "submittedAt" | "title" | "id";

  return { [prismaField]: direction };
};

export const projectsRepository = {
  findAll: async (filter: ProjectListFilter): Promise<ProjectListResult> => {
    const where = buildWhere(filter);
    const [items, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        include: projectInclude,
        orderBy: [buildOrderBy(filter.orderBy, filter.orderDirection), { id: "asc" }],
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize
      }),
      prisma.project.count({ where })
    ]);

    return { items, total };
  },

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
