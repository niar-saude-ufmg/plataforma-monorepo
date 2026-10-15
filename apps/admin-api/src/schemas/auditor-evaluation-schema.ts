import { z } from "zod";

export const projectVersionIdParamSchema = z.object({
  project_version_id: z.coerce.number().int().positive()
});

export const assignAuditorEvaluationSchema = z.object({
  assigned_to_user_id: z.coerce.number().int().positive().optional()
});

export const updateAuditorEvaluationSchema = z.object({
  status: z.enum([
    "sent_to_committee",
    "approved",
    "rejected",
    "needs_changes",
    "approved_by_committee",
    "rejected_by_committee",
    "needs_changes_by_committee"
  ]),
  committee_member_user_id: z.coerce.number().int().positive().optional(),
  justification: z.string().trim().optional()
});

export type AssignAuditorEvaluationInput = z.infer<typeof assignAuditorEvaluationSchema>;
export type UpdateAuditorEvaluationInput = z.infer<typeof updateAuditorEvaluationSchema>;
