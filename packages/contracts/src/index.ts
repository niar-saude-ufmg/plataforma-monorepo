export type UserRole = "researcher" | "admin" | "committee";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  researcher: "Pesquisador",
  admin: "Gestor",
  committee: "Comissão"
};

export type ProjectStatus =
  | "draft"
  | "saved"
  | "submitted_to_committee"
  | "resubmitted_to_committee"
  | "under_review"
  | "approved"
  | "changes_requested";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Rascunho",
  saved: "Salvo",
  submitted_to_committee: "Enviado para comissão",
  resubmitted_to_committee: "Reenviado para comissão",
  under_review: "Em avaliação",
  approved: "Aprovado",
  changes_requested: "Ajustes solicitados"
};
