import { AppError } from "../errors/app-error.js";
import { specialtiesRepository } from "../repositories/specialties-repository.js";
import {
  CreateSpecialtyInput,
  ListSpecialtiesQuery,
  SpecialtiesListResponse,
  SpecialtyResponse,
  UpdateSpecialtyInput
} from "../schemas/specialty-schema.js";

// Usada para achar duplicidade de nome mesmo com diferença de
// maiúsculas/minúsculas ou espaços nas pontas (ex: "Epidemiologia " e
// "epidemiologia" contam como o mesmo nome).
const normalizeName = (name: string) => name.trim().toLowerCase();

export const specialtiesService = {
  listSpecialties: async (query: ListSpecialtiesQuery): Promise<SpecialtiesListResponse> => {
    let isActive: boolean | undefined;
    if (query.is_active === "true") {
      isActive = true;
    }
    if (query.is_active === "false") {
      isActive = false;
    }

    const filter = {
      query: query.query,
      isActive,
      page: query.page,
      pageSize: query.page_size
    };

    const result = await specialtiesRepository.findAll(filter);

    return {
      items: result.items.map((specialty) => ({
        id: specialty.id,
        code: specialty.code,
        name: specialty.name,
        description: specialty.description,
        guidance_context: specialty.guidanceContext,
        is_active: specialty.isActive,
        created_at: specialty.createdAt.toISOString(),
        updated_at: specialty.updatedAt.toISOString()
      })),
      pagination: {
        page: query.page,
        page_size: query.page_size,
        total_items: result.total,
        total_pages: Math.ceil(result.total / query.page_size)
      }
    };
  },

  createSpecialty: async (data: CreateSpecialtyInput): Promise<SpecialtyResponse> => {
    const code = data.code.trim();
    const name = data.name.trim();
    const existingCode = await specialtiesRepository.findByCode(code);

    if (existingCode) {
      throw new AppError("Já existe uma especialidade com este código", 409);
    }

    const nameNormalized = normalizeName(name);
    const existingName = await specialtiesRepository.findByNameNormalized(nameNormalized);

    if (existingName) {
      throw new AppError("Já existe uma especialidade com este nome", 409);
    }

    const specialty = await specialtiesRepository.create({
      code,
      name,
      nameNormalized,
      description: data.description ?? "",
      guidanceContext: data.guidance_context ?? ""
    });

    return {
      id: specialty.id,
      code: specialty.code,
      name: specialty.name,
      description: specialty.description,
      guidance_context: specialty.guidanceContext,
      is_active: specialty.isActive,
      created_at: specialty.createdAt.toISOString(),
      updated_at: specialty.updatedAt.toISOString()
    };
  },

  updateSpecialty: async (id: number, data: UpdateSpecialtyInput): Promise<SpecialtyResponse> => {
    const specialty = await specialtiesRepository.findById(id);

    if (!specialty) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    const name = data.name?.trim();
    let nameNormalized: string | undefined;

    if (name !== undefined) {
      nameNormalized = normalizeName(name);
      const existingName = await specialtiesRepository.findByNameNormalized(nameNormalized);

      if (existingName && existingName.id !== id) {
        throw new AppError("Já existe uma especialidade com este nome", 409);
      }
    }

    const updated = await specialtiesRepository.update(id, {
      name,
      nameNormalized,
      description: data.description,
      guidanceContext: data.guidance_context
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      description: updated.description,
      guidance_context: updated.guidanceContext,
      is_active: updated.isActive,
      created_at: updated.createdAt.toISOString(),
      updated_at: updated.updatedAt.toISOString()
    };
  },

  updateStatus: async (id: number, isActive: boolean): Promise<SpecialtyResponse> => {
    const specialty = await specialtiesRepository.findById(id);

    if (!specialty) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    const updated = await specialtiesRepository.update(id, { isActive });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      description: updated.description,
      guidance_context: updated.guidanceContext,
      is_active: updated.isActive,
      created_at: updated.createdAt.toISOString(),
      updated_at: updated.updatedAt.toISOString()
    };
  }
};
