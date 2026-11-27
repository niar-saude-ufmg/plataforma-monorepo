import type { CreateProjectSectionTemplateInput, ProjectSectionTemplateDefinition } from "@niar/contracts";

export const projectSectionTemplateInput: CreateProjectSectionTemplateInput = {
  template_key: "projeto_social",
  name: "Template de projeto social",
  definition_json: {
    schema_version: 1,
    sections: [
      {
        key: "objetivo",
        label: "Objetivo",
        guidance: ["Descreva o objetivo geral do projeto."],
        prompt: "Qual é o objetivo do projeto?",
        required: true
      },
      {
        key: "publico_alvo",
        label: "Público-alvo",
        guidance: ["Descreva quem será beneficiado."],
        required: false
      }
    ]
  }
};

// Resultado de `definitionSchema.parse(projectSectionTemplateInput.definition_json)`:
// a segunda seção não tem `prompt`, então o default `""` é aplicado.
export const projectSectionTemplateDefinition: ProjectSectionTemplateDefinition = {
  schema_version: 1,
  sections: [
    {
      key: "objetivo",
      label: "Objetivo",
      guidance: ["Descreva o objetivo geral do projeto."],
      prompt: "Qual é o objetivo do projeto?",
      required: true
    },
    {
      key: "publico_alvo",
      label: "Público-alvo",
      guidance: ["Descreva quem será beneficiado."],
      prompt: "",
      required: false
    }
  ]
};
