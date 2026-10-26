import { formatQuestionnaireVersion, QUESTIONNAIRE_CHOICE_TYPES, QUESTIONNAIRE_QUESTION_TYPES } from "@niar/contracts";
import { createQuestionnaireSchema, questionnaireDefinitionSchema, updateQuestionnaireSchema } from "../src/schemas/questionnaire-schema.js";
import { questionnaireInput } from "./fixtures/questionnaires.js";

const withQuestion = (question: unknown) => ({
  ...questionnaireInput,
  sections: [{ id: "livre", title: "Seção dinâmica", description: "Descrição", questions: [question] }]
});
const question = { id: "pergunta", label: "Enunciado", required: true };
const options = [{ id: "a", value: "Primeira" }, { id: "b", value: "Segunda" }];

describe("contrato do questionário", () => {
  it.each(QUESTIONNAIRE_QUESTION_TYPES)("aceita o tipo compartilhado %s", (type) => {
    const input = withQuestion({ ...question, type, ...(["radio", "checkbox", "select"].includes(type) ? { options } : {}) });
    expect(createQuestionnaireSchema.safeParse(input).success).toBe(true);
  });

  it.each(QUESTIONNAIRE_CHOICE_TYPES)("exige duas alternativas para %s", (type) => {
    for (const alternatives of [undefined, [], options.slice(0, 1)]) {
      expect(createQuestionnaireSchema.safeParse(withQuestion({ ...question, type, options: alternatives })).success).toBe(false);
    }
  });

  it("não aceita alternativas em campo de texto", () => {
    expect(createQuestionnaireSchema.safeParse(withQuestion({ ...question, type: "text", options })).success).toBe(false);
  });

  it("não aceita IDs repetidos de alternativas na mesma questão", () => {
    expect(createQuestionnaireSchema.safeParse(withQuestion({ ...question, type: "radio", options: [options[0], options[0]] })).success).toBe(false);
  });

  it("permite reutilizar o ID de alternativa em questões distintas", () => {
    const input = { ...questionnaireInput, sections: [{ id: "secao", title: "Seção", questions: [
      { ...question, id: "q_1", type: "radio", options },
      { ...question, id: "q_2", type: "radio", options }
    ] }] };
    expect(createQuestionnaireSchema.safeParse(input).success).toBe(true);
  });

  it("rejeita seções e questões sem conteúdo", () => {
    expect(createQuestionnaireSchema.safeParse({ ...questionnaireInput, sections: [] }).success).toBe(false);
    expect(createQuestionnaireSchema.safeParse({ ...questionnaireInput, sections: [{ id: "secao", title: "Seção", questions: [] }] }).success).toBe(false);
  });

  it("rejeita IDs de seção duplicados", () => {
    expect(createQuestionnaireSchema.safeParse({ ...questionnaireInput, sections: [questionnaireInput.sections[0], questionnaireInput.sections[0]] }).success).toBe(false);
  });

  it("rejeita IDs de questão repetidos entre seções", () => {
    expect(createQuestionnaireSchema.safeParse({ ...questionnaireInput, sections: [
      questionnaireInput.sections[0], { ...questionnaireInput.sections[0], id: "outra_secao" }
    ] }).success).toBe(false);
  });

  it.each(["Com Acentos", "ação", "id espaço", "_inicio"])("rejeita identificador %s", (key) => {
    expect(createQuestionnaireSchema.safeParse({ ...questionnaireInput, key }).success).toBe(false);
  });

  it("não mantém answer_key nem a lista antiga de tipos", () => {
    expect(createQuestionnaireSchema.safeParse(withQuestion({ ...question, type: "text", answer_key: "pergunta" })).success).toBe(false);
    expect(createQuestionnaireSchema.safeParse(withQuestion({ ...question, type: "boolean" })).success).toBe(false);
  });

  it("normaliza os textos e mantém a ordem escolhida pelo administrador", () => {
    const parsed = createQuestionnaireSchema.parse({ ...questionnaireInput, key: "  teste  ", title: " Teste " });
    expect(parsed.key).toBe("teste");
    expect(parsed.title).toBe("Teste");
    expect(parsed.sections[0].description).toBe("Descreva a pesquisa.");
  });

  it("não aceita versão manual nem identificação na edição", () => {
    expect(createQuestionnaireSchema.safeParse({ ...questionnaireInput, version: 1 }).success).toBe(false);
    expect(updateQuestionnaireSchema.safeParse(questionnaireInput).success).toBe(false);
  });

  it.each([0, -1, 1.5, "1.0", "1.0.0"])("rejeita versão interna inválida %s", (version) => {
    expect(questionnaireDefinitionSchema.safeParse({ ...questionnaireInput, version }).success).toBe(false);
  });

  it("valida a versão gerada e compartilha a formatação de exibição", () => {
    expect(questionnaireDefinitionSchema.parse({ ...questionnaireInput, version: 10 }).version).toBe(10);
    expect(formatQuestionnaireVersion(1)).toBe("1.0");
    expect(formatQuestionnaireVersion(10)).toBe("10.0");
  });
});
