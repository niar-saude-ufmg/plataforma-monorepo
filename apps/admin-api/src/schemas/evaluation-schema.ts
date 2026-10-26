import { z } from "zod";

export const projectVersionIdParamSchema = z.object({
  project_version_id: z.coerce.number().int().positive()
});

export const assignEvaluationSchema = z.object({
  assigned_to_user_id: z.coerce.number().int().positive().optional()
});

export const updateEvaluationSchema = z.object({
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

export type AssignEvaluationInput = z.infer<typeof assignEvaluationSchema>;
export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;
