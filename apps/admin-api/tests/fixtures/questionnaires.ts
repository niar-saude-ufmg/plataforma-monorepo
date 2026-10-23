import type { CreateQuestionnaireInput } from "@niar/contracts";

export const questionnaireInput: CreateQuestionnaireInput = {
  key: "formulario_fiar",
  title: "Formulário de entrada FIAR",
  sections: [{
    id: "contexto",
    title: "Contexto da pesquisa",
    description: "Descreva a pesquisa.",
    questions: [
      { id: "objetivo", type: "textarea", label: "Qual é o objetivo da pesquisa?", required: true },
      {
        id: "fonte_dados", type: "radio", label: "Qual será a fonte dos dados?", required: true,
        options: [{ id: "propria", value: "Base própria" }, { id: "niar", value: "Base do NIAR" }]
      }
    ]
  }]
};
