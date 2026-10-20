export type UserRole = "researcher" | "admin" | "auditor" | "committee";

export type UserAccountStatus = "pending" | "active" | "rejected" | "disabled";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  researcher: "Pesquisador",
  admin: "Gestor",
  auditor: "Auditor",
  committee: "Comitê"
};

export type ProjectStatus =
  | "draft"
  | "saved"
  | "submitted_for_review"
  | "submitted_to_committee"
  | "approved_to_schedule"
  | "rejected_to_safe_room"
  | "resubmitted_for_review"
  | "resubmitted_to_committee"
  | "under_review"
  | "scheduled_for_safe_room"
  | "approved_for_safe_room"
  | "under_safe_room"
  | "report_submitted"
  | "report_under_review"
  | "safe_room_reuse_requested"
  | "rescheduled_for_safe_room"
  | "reapproved_for_safe_room"
  | "report_resubmitted"
  | "needs_changes"
  | "approved"
  | "rejected"
  | "changes_requested";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  saved: "Salvo",
  submitted_for_review: "Enviado para avaliação",
  submitted_to_committee: "Enviado ao comitê",
  approved_to_schedule: "Aprovado para agendar",
  rejected_to_safe_room: "Rejeitado p/ sala segura",
  resubmitted_for_review: "Reenviado para avaliação",
  resubmitted_to_committee: "Reenviado ao comitê",
  under_review: "Em avaliação",
  scheduled_for_safe_room: "Sala segura agendada",
  approved_for_safe_room: "Aprovado p/ sala segura",
  under_safe_room: "Em sala segura",
  report_submitted: "Relatório enviado",
  report_under_review: "Relatório em avaliação",
  safe_room_reuse_requested: "Reuso solicitado",
  rescheduled_for_safe_room: "Sala segura reagendada",
  reapproved_for_safe_room: "Reaprovado p/ sala segura",
  report_resubmitted: "Relatório reenviado",
  needs_changes: "Precisa de alterações",
  approved: "Aprovado",
  rejected: "Rejeitado",
  changes_requested: "Ajustes solicitados"
};

export type EvaluationStatus =
  | "waiting"
  | "to_review"
  | "sent_to_committee"
  | "approved_by_committee"
  | "rejected_by_committee"
  | "needs_changes_by_committee"
  | "needs_changes"
  | "approved"
  | "rejected";

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  waiting: "Aguardando atribuição",
  to_review: "Aguardando avaliação",
  sent_to_committee: "Enviado ao comitê",
  approved_by_committee: "Aprovado pelo comitê",
  rejected_by_committee: "Rejeitado pelo comitê",
  needs_changes_by_committee: "Há alterações pelo comitê",
  needs_changes: "Precisa de alterações",
  approved: "Aprovado",
  rejected: "Rejeitado"
};

export type EvaluationContext = "pre_safe_room" | "post_safe_room";

export const EVALUATION_CONTEXT_LABELS: Record<EvaluationContext, string> = {
  pre_safe_room: "Pré-sala segura",
  post_safe_room: "Pós-sala segura"
};
