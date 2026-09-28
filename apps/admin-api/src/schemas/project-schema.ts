import { z } from "zod";

export const projectStatusSchema = z.enum([
  "submitted_to_committee",
  "resubmitted_to_committee",
  "under_review",
  "needs_changes",
  "approved",
  "rejected"
]);

const optionalDate = z.coerce.date().optional();

export const listProjectsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    page_size: z.coerce.number().int().positive().max(100).default(20),
    status: projectStatusSchema.optional(),
    submitted_from: optionalDate,
    submitted_to: optionalDate,
    updated_from: optionalDate,
    updated_to: optionalDate,
    researcher_id: z.coerce.number().int().positive().optional(),
    version_number: z.coerce.number().int().positive().optional(),
    document_type: z.string().trim().min(1).max(100).optional(),
    has_document: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
    search: z.string().trim().min(1).max(255).optional(),
    order_by: z.enum(["updated_at", "submitted_at", "title", "id"]).default("updated_at"),
    order_direction: z.enum(["asc", "desc"]).default("desc")
  })
  .refine((query) => !query.submitted_from || !query.submitted_to || query.submitted_from <= query.submitted_to, {
    message: "submitted_from deve ser anterior ou igual a submitted_to",
    path: ["submitted_to"]
  })
  .refine((query) => !query.updated_from || !query.updated_to || query.updated_from <= query.updated_to, {
    message: "updated_from deve ser anterior ou igual a updated_to",
    path: ["updated_to"]
  });

export const projectParamsSchema = z.object({
  projectId: z.coerce.number().int().positive()
});

export const projectDocumentParamsSchema = projectParamsSchema.extend({
  documentId: z.coerce.number().int().positive()
});

export type ProjectStatusCode = z.infer<typeof projectStatusSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

export type ProjectStatusResponse = {
  code: ProjectStatusCode;
  label: string;
  version_number: number;
  created_at: string;
  notes: string | null;
};

export type ProjectDocumentResponse = {
  id: number;
  version_number: number;
  document_type: string;
  original_filename: string;
  created_at: string;
  download_url: string;
};

export type ProjectResponse = {
  id: number;
  title: string;
  updated_at: string;
  status: ProjectStatusResponse[];
  documents: ProjectDocumentResponse[];
};
