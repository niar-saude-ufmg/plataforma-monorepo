import { z } from "zod";

export const projectStatusSchema = z.enum([
  "submitted_for_review",
  "submitted_to_committee",
  "approved_to_schedule",
  "rejected_to_safe_room",
  "resubmitted_for_review",
  "resubmitted_to_committee",
  "under_review",
  "scheduled_for_safe_room",
  "approved_for_safe_room",
  "under_safe_room",
  "report_submitted",
  "report_under_review",
  "safe_room_reuse_requested",
  "rescheduled_for_safe_room",
  "reapproved_for_safe_room",
  "report_resubmitted",
  "needs_changes",
  "approved",
  "rejected"
]);

export const projectEvaluationStatusSchema = z.enum([
  "waiting",
  "to_review",
  "sent_to_committee",
  "approved_by_committee",
  "rejected_by_committee",
  "needs_changes_by_committee",
  "approved",
  "needs_changes",
  "rejected"
]);

export const projectEvaluationContextSchema = z.enum(["pre_safe_room", "post_safe_room"]);

const optionalDate = (boundary: "from" | "to") =>
  z.preprocess(
    (value) => {
      if (boundary === "to" && typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return `${value}T23:59:59.999Z`;
      }
      return value;
    },
    z.coerce.date().optional()
  );

export const listProjectsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    page_size: z.coerce.number().int().positive().max(100).default(20),
    status: projectStatusSchema.optional(),
    evaluation_status: projectEvaluationStatusSchema.optional(),
    evaluation_context: projectEvaluationContextSchema.optional(),
    submitted_from: optionalDate("from"),
    submitted_to: optionalDate("to"),
    updated_from: optionalDate("from"),
    updated_to: optionalDate("to"),
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
export type ProjectEvaluationStatusCode = z.infer<typeof projectEvaluationStatusSchema>;
export type ProjectEvaluationContextCode = z.infer<typeof projectEvaluationContextSchema>;
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

export type ProjectResearcherResponse = {
  id: number;
  full_name: string;
  email: string;
};

export type ProjectEvaluationResponse = {
  id: number;
  version_number: number;
  status: ProjectEvaluationStatusCode;
  assigned_to: {
    user_id: number;
    full_name: string;
    email: string;
    role: string;
  } | null;
  assigned_by: {
    user_id: number;
    full_name: string;
    email: string;
    role: string;
  } | null;
  justification: string | null;
  evaluated_at: string | null;
  updated_at: string;
};

export type ProjectResponse = {
  id: number;
  title: string;
  updated_at: string;
  researcher: ProjectResearcherResponse;
  evaluation_status?: ProjectEvaluationStatusCode;
  evaluation_context?: ProjectEvaluationContextCode | null;
  status: ProjectStatusResponse[];
  documents: ProjectDocumentResponse[];
  evaluations?: ProjectEvaluationResponse[];
};

export type ProjectListResponse = {
  items: ProjectResponse[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};
