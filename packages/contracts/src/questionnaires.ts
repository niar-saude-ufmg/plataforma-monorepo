export const QUESTIONNAIRE_TEXT_TYPES = ["text", "textarea"] as const;
export const QUESTIONNAIRE_CHOICE_TYPES = ["radio", "checkbox", "select"] as const;
export const QUESTIONNAIRE_QUESTION_TYPES = [...QUESTIONNAIRE_TEXT_TYPES, ...QUESTIONNAIRE_CHOICE_TYPES] as const;

export type QuestionnaireQuestionType = (typeof QUESTIONNAIRE_QUESTION_TYPES)[number];

export const QUESTIONNAIRE_QUESTION_TYPE_LABELS: Record<QuestionnaireQuestionType, string> = {
  text: "Texto",
  textarea: "Texto longo",
  radio: "Escolha única",
  checkbox: "Múltipla escolha",
  select: "Lista suspensa"
};

export type QuestionnaireOption = { id: string; value: string };

type QuestionnaireQuestionBase = {
  id: string;
  label: string;
  required: boolean;
  description?: string;
};

export type QuestionnaireQuestion = QuestionnaireQuestionBase & (
  | { type: "text" | "textarea"; options?: never }
  | { type: "radio" | "checkbox" | "select"; options: QuestionnaireOption[] }
);

export type QuestionnaireSection = {
  id: string;
  title: string;
  description?: string;
  questions: QuestionnaireQuestion[];
};

export type CreateQuestionnaireInput = {
  key: string;
  title: string;
  sections: QuestionnaireSection[];
};

export type UpdateQuestionnaireInput = Pick<CreateQuestionnaireInput, "sections">;
export type QuestionnaireDefinition = CreateQuestionnaireInput & { version: number };

export type QuestionnaireResponse = {
  id: number;
  key: string;
  version: number;
  title: string;
  definition_json: QuestionnaireDefinition;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuestionnairesListResponse = {
  items: QuestionnaireResponse[];
  pagination: { page: number; page_size: number; total_items: number; total_pages: number };
};

/** A versão é sequencial; o sufixo .0 é apenas apresentação, não SemVer. */
export const formatQuestionnaireVersion = (version: number): string => `${version}.0`;
