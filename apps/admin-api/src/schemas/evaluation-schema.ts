import { z } from "zod";

export const projectVersionIdParamSchema = z.object({
  project_version_id: z.coerce.number().int().positive()
});

export const assignEvaluationSchema = z.object({
  assigned_to_user_id: z.coerce.number().int().positive().optional()
});

export const updateEvaluationSchema = z.object({
  status: z.enum([
    "project_approved",
    "project_rejected",
    "project_changes_requested",
    "report_approved",
    "report_rejected",
    "report_changes_requested"
  ]),
  justification: z.string().trim().optional(),
  certification_decision: z.enum(["granted", "not_granted"]).optional(),
  certification_reason: z.string().trim().optional()
}).superRefine((data, context) => {
  if (data.status === "report_approved" && !data.certification_decision) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["certification_decision"], message: "A decisão sobre o selo é obrigatória ao aprovar o relatório" });
  }
  if (data.status !== "report_approved" && (data.certification_decision || data.certification_reason)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["certification_decision"], message: "A decisão sobre o selo só pode ser registrada ao aprovar o relatório" });
  }
  if (data.certification_decision === "not_granted" && !data.certification_reason) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["certification_reason"], message: "A justificativa é obrigatória quando o selo não é concedido" });
  }
});

export type AssignEvaluationInput = z.infer<typeof assignEvaluationSchema>;
export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;
