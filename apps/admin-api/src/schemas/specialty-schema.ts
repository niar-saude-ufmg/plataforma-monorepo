import { z } from "zod";

export const createSpecialtySchema = z.object({
  code: z.string().min(1, { message: "Code is required" }).max(100),
  name: z.string().min(1, { message: "Name is required" }).max(255),
  description: z.string().max(2000).optional(),
  guidance_context: z.string().max(4000).optional()
});

export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>;

// "code" não entra aqui de propósito: o card pede que ele seja estável,
// então só é definido na criação.
export const updateSpecialtySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(255).optional(),
  description: z.string().max(2000).optional(),
  guidance_context: z.string().max(4000).optional()
});

export type UpdateSpecialtyInput = z.infer<typeof updateSpecialtySchema>;

export const updateSpecialtyStatusSchema = z.object({
  is_active: z.boolean()
});

export type UpdateSpecialtyStatusInput = z.infer<typeof updateSpecialtyStatusSchema>;

export const specialtyIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const listSpecialtiesQuerySchema = z.object({
  query: z.string().min(1).optional(),
  // Fica como string aqui de propósito (não dá pra usar z.coerce.boolean():
  // Boolean("false") é true em JS). A conversão pra boolean é feita no service.
  is_active: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20)
});

export type ListSpecialtiesQuery = z.infer<typeof listSpecialtiesQuerySchema>;

// Contrato de saída da API, em snake_case.
export type SpecialtyResponse = {
  id: number;
  code: string;
  name: string;
  description: string;
  guidance_context: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
