import type { Meta, StoryObj } from "@storybook/react-vite";
import { Autocomplete } from "./Autocomplete";

const meta = {
  title: "Componentes/Autocomplete",
  component: Autocomplete,
  argTypes: {
    options: {
      description: "Lista de opções exibida no menu de seleção. Pode conter strings ou objetos com label e value.",
      table: { category: "PROPS", type: { summary: "readonly (string | AutocompleteOption)[]" } },
    },
    label: {
      description: "Texto exibido como label do campo outlined.",
      table: { category: "PROPS", type: { summary: "ReactNode" }, defaultValue: { summary: "Selecionar" } },
    },
    multiple: {
      description: "Permite selecionar mais de uma opção e exibe os valores selecionados no campo.",
      table: { category: "PROPS", type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      description: "Desabilita o campo e impede novas seleções.",
      table: { category: "PROPS", type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    onChange: {
      description: "Callback chamado quando a pessoa usuária seleciona, remove ou limpa uma opção.",
      control: false,
      table: {
        category: "EVENTS",
        type: { summary: "(event, value, reason, details?) => void" },
      },
    },
  },
  parameters: {
    docs: {
      codePanel: true,
      description: { component: "Campo de busca e seleção baseado no Autocomplete do MUI. Use-o para filtros e seleção de projetos, usuários ou status com busca incremental." },
      source: { code: '<Autocomplete options={["Opção 1", "Opção 2"]} label="Autocomplete" />' },
    },
  },
  args: {
    options: ["Opção 1", "Opção 2", "Opção 3"],
    label: "Autocomplete",
  },
} satisfies Meta<typeof Autocomplete>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: { docs: { description: { story: "Uso básico para selecionar uma opção." } } },
};
export const Multiple: Story = {
  args: { multiple: true, label: "Filtros" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Permite selecionar várias opções para filtros combinados." },
      source: { code: '<Autocomplete multiple options={["Opção 1", "Opção 2"]} label="Filtros" />' },
    },
  },
};
