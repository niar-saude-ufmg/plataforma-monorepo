import { Prisma, prisma } from "@niar/database";
import type { CreateQuestionnaireInput, QuestionnaireDefinition, UpdateQuestionnaireInput } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import { questionnaireDefinitionSchema } from "../schemas/questionnaire-schema.js";

export type QuestionnaireListFilter = {
  key?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
};

export type QuestionnaireRecord = {
  id: number;
  questionnaireKey: string;
  version: number;
  title: string;
  definitionJson: unknown;
  isActive: boolean;
  publishedAt: Date | null;
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
      if (attempt >= 2) throw new AppError("Conflito ao salvar questionário. Tente novamente.", 409);
    }
  }
};

const findOrFail = async (client: Prisma.TransactionClient, id: number) => {
  const item = await client.questionnaire.findUnique({ where: { id } });
  if (!item) throw new AppError("Questionário não encontrado", 404);
  return item;
};

export const questionnairesRepository = {
  findAll: async (filter: QuestionnaireListFilter) => {
    const where = { questionnaireKey: filter.key, isActive: filter.isActive };
    const [items, total] = await prisma.$transaction([
      prisma.questionnaire.findMany({
        where,
        orderBy: [{ questionnaireKey: "asc" }, { version: "desc" }],
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize
      }),
      prisma.questionnaire.count({ where })
    ]);
    return { items, total };
  },

  findById: (id: number) => prisma.questionnaire.findUnique({ where: { id } }),

  create: (input: CreateQuestionnaireInput) => transaction(async (client) => {
    const previous = await client.questionnaire.findFirst({
      where: { questionnaireKey: input.key },
      orderBy: { version: "desc" }
    });
    if (previous && previous.title !== input.title) {
      throw new AppError("Uma nova versão deve manter o título da família do questionário", 400);
    }
    const version = (previous?.version ?? 0) + 1;
    if (version > 2147483647) throw new AppError("Limite de versões atingido", 409);
    const definition: QuestionnaireDefinition = { ...input, version };
    return client.questionnaire.create({
      data: {
        questionnaireKey: input.key,
        version,
        title: input.title,
        definitionJson: definition
      }
    });
  }),

  update: (id: number, input: UpdateQuestionnaireInput) => transaction(async (client) => {
    const current = await findOrFail(client, id);
    if (current.publishedAt || current.isActive) {
      throw new AppError("Uma versão já publicada não pode ser editada. Crie uma nova versão.", 409);
    }
    const definition: QuestionnaireDefinition = {
      key: current.questionnaireKey,
      version: current.version,
      title: current.title,
      sections: input.sections
    };
    return client.questionnaire.update({
      where: { id },
      data: { definitionJson: definition, updatedAt: new Date() }
    });
  }),

  publish: (id: number) => transaction(async (client) => {
    const current = await findOrFail(client, id);
    if (current.isActive) return current;
    if (current.publishedAt) {
      throw new AppError("Uma versão publicada anteriormente não pode ser republicada. Crie uma nova versão.", 409);
    }
    // Valida também o JSON persistido, não apenas o body recebido na criação.
    const definition = questionnaireDefinitionSchema.parse(current.definitionJson);
    if (definition.key !== current.questionnaireKey || definition.version !== current.version || definition.title !== current.title) {
      throw new AppError("A definição do questionário não corresponde à sua identificação", 409);
    }
    await client.questionnaire.updateMany({
      where: { questionnaireKey: current.questionnaireKey, isActive: true, id: { not: id } },
      data: { isActive: false, updatedAt: new Date() }
    });
    return client.questionnaire.update({
      where: { id },
      data: { isActive: true, publishedAt: new Date(), updatedAt: new Date() }
    });
  })
};
