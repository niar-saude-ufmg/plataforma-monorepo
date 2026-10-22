import type { CreateQuestionnaireInput, QuestionnaireResponse, QuestionnairesListResponse, UpdateQuestionnaireInput } from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import { questionnairesRepository, type QuestionnaireRecord } from "../repositories/questionnaires-repository.js";
import { questionnaireDefinitionSchema, type ListQuestionnairesQuery } from "../schemas/questionnaire-schema.js";

const toResponse = (item: QuestionnaireRecord): QuestionnaireResponse => ({
  id: item.id,
  key: item.questionnaireKey,
  version: item.version,
  title: item.title,
  definition_json: questionnaireDefinitionSchema.parse(item.definitionJson),
  is_active: item.isActive,
  published_at: item.publishedAt?.toISOString() ?? null,
  created_at: item.createdAt.toISOString(),
  updated_at: item.updatedAt.toISOString()
});

export const questionnairesService = {
  listQuestionnaires: async (query: ListQuestionnairesQuery): Promise<QuestionnairesListResponse> => {
    const result = await questionnairesRepository.findAll({
      key: query.key,
      isActive: query.is_active,
      page: query.page,
      pageSize: query.page_size
    });
    return {
      items: result.items.map(toResponse),
      pagination: {
        page: query.page,
        page_size: query.page_size,
        total_items: result.total,
        total_pages: Math.ceil(result.total / query.page_size)
      }
    };
  },

  getQuestionnaire: async (id: number): Promise<QuestionnaireResponse> => {
    const item = await questionnairesRepository.findById(id);
    if (!item) throw new AppError("Questionário não encontrado", 404);
    return toResponse(item);
  },

  createQuestionnaire: async (input: CreateQuestionnaireInput): Promise<QuestionnaireResponse> =>
    toResponse(await questionnairesRepository.create(input)),

  updateQuestionnaire: async (id: number, input: UpdateQuestionnaireInput): Promise<QuestionnaireResponse> =>
    toResponse(await questionnairesRepository.update(id, input)),

  publishQuestionnaire: async (id: number): Promise<QuestionnaireResponse> =>
    toResponse(await questionnairesRepository.publish(id))
};
