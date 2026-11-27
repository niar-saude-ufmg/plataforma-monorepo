import { z } from "zod";
import type { ReportDeliveryInput } from "@niar/contracts";

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
  evaluation_id: z.number().int().positive().optional(),
  justification: z.string().trim().optional(),
  certification_decision: z.enum(["granted", "not_granted"]).optional(),
  certification_reason: z.string().trim().optional()
}).superRefine((data, context) => {
  if (data.status.startsWith("report_") && data.evaluation_id === undefined) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["evaluation_id"], message: "evaluation_id é obrigatório para avaliar a entrega de relatório" });
  }
  if ((data.status.endsWith("rejected") || data.status.endsWith("changes_requested")) && !data.justification) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["justification"], message: "A justificativa é obrigatória para rejeitar ou solicitar alterações" });
  }
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

export const receiveReportSchema: z.ZodType<ReportDeliveryInput> = z.object({
  delivery_number: z.number().int().positive(),
  documents: z.array(z.object({
    source_export_artifact_id: z.number().int().positive(),
    questionnaire_id: z.number().int().positive().optional()
  }).strict()).min(1).max(50)
}).strict().refine((data) => new Set(data.documents.map((doc) => doc.source_export_artifact_id)).size === data.documents.length, {
  message: "Artefatos duplicados na entrega"
});

export type ReceiveReportInput = z.infer<typeof receiveReportSchema>;
export type AssignEvaluationInput = z.infer<typeof assignEvaluationSchema>;
export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;
