import { Prisma, type project_status as ProjectStatus, prisma } from "@niar/database";

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
      committeeEvaluation: {
        include: {
          responsibleMember: {
            select: {
              userId: true,
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              },
              specialty: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
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
  ownerUserId?: number;
  status?: ProjectStatus;
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

const buildWhere = (filter: Omit<ProjectListFilter, "page" | "pageSize" | "orderBy" | "orderDirection">) => {
  const versionWhere: Prisma.ProjectVersionWhereInput = {};

  if (filter.status) versionWhere.status = filter.status;
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
