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

export const questionnaireWithGroupInput: CreateQuestionnaireInput = {
  key: "data_card",
  title: "Data Card",
  sections: [{
    id: "metodologia",
    title: "Metodologia da pesquisa",
    questions: [
      {
        id: "fontes_dados",
        type: "radio",
        label: "Qual será a fonte dos dados?",
        required: true,
        information: { content: "Informe se os dados são de base própria ou do NIAR.", severity: "info" },
        options: [{ id: "base_propria", value: "Base própria" }, { id: "base_niar", value: "Base do NIAR" }]
      },
      {
        id: "campos_sensiveis",
        type: "group",
        title: "Campos com dados sensíveis",
        fields: [
          { id: "campo", label: "Campo", type: "text" },
          { id: "tipo_dado_sensivel", label: "Tipo de dado sensível", type: "text" },
          { id: "medida_protecao", label: "Medida de proteção aplicada", type: "textarea" }
        ]
      }
    ]
  }]
};
