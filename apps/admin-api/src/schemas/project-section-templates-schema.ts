import { z } from "zod";import type {
  CreateProjectSectionTemplateInput,
  UpdateProjectSectionTemplateInput,
} from "@niar/contracts";

const identifierSchema = z.string().trim().min(1).max(100)
  .regex(/^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/, "Use letras minúsculas, números, underline ou hífen, sem acentos");

const sectionSchema = z.object({
  key: identifierSchema.max(50),
  label: z.string().trim().min(1).max(255),
  guidance: z.array(z.string().trim().min(1)),
  prompt: z.string().trim().optional().default(""),
  required: z.boolean()
}).strict();

export const definitionSchema = z.object({
  schema_version: z.number().int().positive(),
  sections: z.array(sectionSchema).min(1).superRefine((sections, context) => {
    const keys = sections.map((section) => section.key);
    if (new Set(keys).size !== keys.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As chaves (keys) das seções não podem se repetir"
      });
    }
  })
}).strict();

export const createProjectSectionTemplateSchema: z.ZodType<CreateProjectSectionTemplateInput> = z.object({
  template_key: identifierSchema,
  name: z.string().trim().min(1).max(255),
  definition_json: definitionSchema
}).strict();

export const updateProjectSectionTemplateSchema: z.ZodType<UpdateProjectSectionTemplateInput> = z.object({
  name: z.string().trim().min(1).max(255),
  definition_json: definitionSchema
}).strict();

export const projectSectionTemplateIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const listProjectSectionTemplatesQuerySchema = z.object({
  template_key: identifierSchema.optional(),
  is_active: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20)
});

export type ListProjectSectionTemplatesQuery = z.infer<typeof listProjectSectionTemplatesQuerySchema>;
