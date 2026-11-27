import { Prisma, prisma } from "@niar/database";
import type { CreateProjectSectionTemplateInput, UpdateProjectSectionTemplateInput } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import { definitionSchema } from "../schemas/project-section-templates-schema.js";

export type ProjectSectionTemplateListFilter = {
  templateKey?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
};

export type ProjectSectionTemplateRecord = {
  id: number;
  templateKey: string;
  version: number;
  name: string;
  definitionJson: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Serializa leituras/escritas concorrentes. Um conflito reexecuta toda a
// operação, recalculando a versão ou relendo o estado de publicação.
const transaction = async <T>(operation: (client: Prisma.TransactionClient) => Promise<T>): Promise<T> => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await prisma.$transaction(operation, { isolationLevel: "Serializable" });
    } catch (error) {
      const conflict = error instanceof Prisma.PrismaClientKnownRequestError
        && (error.code === "P2034" || error.code === "P2002");
      if (!conflict) throw error;
      if (attempt >= 2) throw new AppError("Conflito ao salvar template. Tente novamente.", 409);
    }
  }
};

const findOrFail = async (client: Prisma.TransactionClient, id: number) => {
  const item = await client.projectSectionTemplate.findUnique({ where: { id } });
  if (!item) throw new AppError("Template de seção de projeto não encontrado", 404);
  return item;
};

export const projectSectionTemplatesRepository = {
  findAll: async (filter: ProjectSectionTemplateListFilter) => {
    const where = { templateKey: filter.templateKey, isActive: filter.isActive };
    const [items, total] = await prisma.$transaction([
      prisma.projectSectionTemplate.findMany({
        where,
        orderBy: [{ templateKey: "asc" }, { version: "desc" }],
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize
      }),
      prisma.projectSectionTemplate.count({ where })
    ]);
    return { items, total };
  },

  findById: async (id: number) => {
    return prisma.projectSectionTemplate.findUnique({ where: { id } });
  },

  create: (input: CreateProjectSectionTemplateInput) => transaction(async (client) => {
    const previous = await client.projectSectionTemplate.findFirst({
      where: { templateKey: input.template_key },
      orderBy: { version: "desc" }
    });
    const version = previous ? previous.version + 1 : 1;
    const definition = definitionSchema.parse(input.definition_json);
    return client.projectSectionTemplate.create({
      data: {
        templateKey: input.template_key,
        name: input.name,
        version,
        definitionJson: definition
      }
    });
  }),

  update: (id: number, input: UpdateProjectSectionTemplateInput) => transaction(async (client) => {
    const item = await findOrFail(client, id);
    if (item.isActive || item.publishedAt) {
      throw new AppError("Um template já publicado não pode ser editado. Crie uma nova versão.", 409);
    }

    const definition = definitionSchema.parse(input.definition_json);
    return client.projectSectionTemplate.update({
      where: { id },
      data: {
        name: input.name,
        definitionJson: definition,
        updatedAt: new Date()
      }
    });
  }),

  publish: (id: number) => transaction(async (client) => {
    const item = await findOrFail(client, id);
    if (item.isActive) return item;
    if (item.publishedAt) {
      throw new AppError("Uma versão já publicada não pode ser republicada. Crie uma nova versão.", 409);
    }

    definitionSchema.parse(item.definitionJson);

    await client.projectSectionTemplate.updateMany({
      where: { templateKey: item.templateKey, isActive: true, id: { not: id } },
      data: { isActive: false, updatedAt: new Date() }
    });
    return client.projectSectionTemplate.update({
      where: { id },
      data: { isActive: true, publishedAt: new Date(), updatedAt: new Date() }
    });
  }),
};
