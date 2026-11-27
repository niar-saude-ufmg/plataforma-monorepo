import type {
  CreateProjectSectionTemplateInput,
  UpdateProjectSectionTemplateInput,
  ProjectSectionTemplateResponse,
  ProjectSectionTemplatesListResponse
} from "@niar/contracts";
import { AppError } from "../errors/app-error.js";
import { projectSectionTemplatesRepository, type ProjectSectionTemplateRecord } from "../repositories/project-section-templates-repository.js";
import { definitionSchema, type ListProjectSectionTemplatesQuery } from "../schemas/project-section-templates-schema.js";

const toResponse = (item: ProjectSectionTemplateRecord) : ProjectSectionTemplateResponse => ({
  id: item.id,
  template_key: item.templateKey,
  name: item.name,
  version: item.version,
  definition_json: definitionSchema.parse(item.definitionJson),
  is_active: item.isActive,
  published_at: item.publishedAt?.toISOString() ?? null,
  created_at: item.createdAt.toISOString(),
  updated_at: item.updatedAt.toISOString()
});

export const projectSectionTemplatesService = {
  listProjectSectionTemplates: async (query: ListProjectSectionTemplatesQuery): Promise<ProjectSectionTemplatesListResponse> => {
    const result = await projectSectionTemplatesRepository.findAll({
      templateKey: query.template_key,
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

  getProjectSectionTemplate: async (id: number): Promise<ProjectSectionTemplateResponse> => {
    const item = await projectSectionTemplatesRepository.findById(id);
    if (!item) throw new AppError("Modelo de seção de projeto não encontrado", 404);
    return toResponse(item);
  },

  createProjectSectionTemplate: async (input: CreateProjectSectionTemplateInput): Promise<ProjectSectionTemplateResponse> =>
    toResponse(await projectSectionTemplatesRepository.create(input)),

  updateProjectSectionTemplate: async (id: number, input: UpdateProjectSectionTemplateInput): Promise<ProjectSectionTemplateResponse> =>
    toResponse(await projectSectionTemplatesRepository.update(id, input)),

  publishProjectSectionTemplate: async (id: number): Promise<ProjectSectionTemplateResponse> =>
    toResponse(await projectSectionTemplatesRepository.publish(id))
};
