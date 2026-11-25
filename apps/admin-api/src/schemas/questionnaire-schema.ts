import { z } from "zod";
import { QUESTIONNAIRE_TEXT_TYPES, QUESTIONNAIRE_CHOICE_TYPES, QUESTIONNAIRE_INFORMATION_SEVERITIES } from "@niar/contracts";
import type { CreateQuestionnaireInput, QuestionnaireDefinition, QuestionnaireQuestion, QuestionnaireSection, UpdateQuestionnaireInput } from "@niar/contracts";

export type { QuestionnaireDefinition, QuestionnaireResponse, QuestionnairesListResponse } from "@niar/contracts";

const identifierSchema = z.string().trim().min(1).max(100)
  .regex(/^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/, "Use letras minúsculas, números, underline ou hífen, sem acentos");

const optionSchema = z.object({
  id: identifierSchema,
  value: z.string().trim().min(1).max(255)
}).strict();

const informationSchema = z.object({
  content: z.string().trim().min(1).max(20000),
  severity: z.enum(QUESTIONNAIRE_INFORMATION_SEVERITIES)
}).strict();

const questionBase = {
  id: identifierSchema,
  label: z.string().trim().min(1).max(1000),
  required: z.boolean(),
  description: z.string().trim().max(2000).optional(),
  information: informationSchema.optional()
};

const questionSchema: z.ZodType<QuestionnaireQuestion> = z.union([
  z.object({ ...questionBase, type: z.enum(QUESTIONNAIRE_TEXT_TYPES) }).strict(),
  z.object({
    ...questionBase,
    type: z.enum(QUESTIONNAIRE_CHOICE_TYPES),
    options: z.array(optionSchema).min(2)
  }).strict()
]).superRefine((question, context) => {
  if (!("options" in question)) return;
  const ids = question.options.map((option) => option.id);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Os IDs das alternativas não podem se repetir na questão" });
  }
});

const groupFieldSchema = z.object({
  id: identifierSchema,
  label: z.string().trim().min(1).max(1000),
  type: z.enum(QUESTIONNAIRE_TEXT_TYPES)
}).strict();

const groupSchema = z.object({
  id: identifierSchema,
  type: z.literal("group"),
  title: z.string().trim().min(1).max(1000).optional(),
  information: informationSchema.optional(),
  fields: z.array(groupFieldSchema).min(1)
}).strict();

const sectionSchema: z.ZodType<QuestionnaireSection> = z.object({
  id: identifierSchema,
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(2000).optional(),
  questions: z.array(z.union([questionSchema, groupSchema])).min(1)
}).strict();

const sectionsSchema = z.array(sectionSchema).min(1).superRefine((sections, context) => {
  const sectionIds = sections.map((section) => section.id);
  if (new Set(sectionIds).size !== sectionIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Os IDs das seções não podem se repetir" });
  }
  const ids = new Set<string>();
  const checkId = (id: string, path: (string | number)[]) => {
    if (ids.has(id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path, message: "Os IDs dos elementos não podem se repetir no questionário" });
    }
    ids.add(id);
  };
  for (const [sectionIndex, section] of sections.entries()) {
    for (const [index, item] of section.questions.entries()) {
      checkId(item.id, [sectionIndex, "questions", index, "id"]);
      if (item.type === "group") {
        item.fields.forEach((field, fieldIndex) => checkId(field.id, [sectionIndex, "questions", index, "fields", fieldIndex, "id"]));
      }
    }
  }
});

const definitionFields = {
  key: identifierSchema,
  title: z.string().trim().min(1).max(255),
  sections: sectionsSchema
};

// O cliente não escolhe a versão. Ela é atribuída ao criar o registro.
export const createQuestionnaireSchema: z.ZodType<CreateQuestionnaireInput> = z.object(definitionFields).strict();
export const updateQuestionnaireSchema: z.ZodType<UpdateQuestionnaireInput> = z.object({ sections: sectionsSchema }).strict();
export const questionnaireDefinitionSchema: z.ZodType<QuestionnaireDefinition> = z.object({
  ...definitionFields,
  version: z.number().int().positive().max(2147483647)
}).strict();

export const questionnaireIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const listQuestionnairesQuerySchema = z.object({
  key: identifierSchema.optional(),
  is_active: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20)
});

export type ListQuestionnairesQuery = z.infer<typeof listQuestionnairesQuerySchema>;
