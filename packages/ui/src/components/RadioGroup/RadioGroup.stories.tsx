import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "./RadioGroup";
const meta = {
  title: "Componentes/RadioGroup",
  component: RadioGroup,
  args: {
    label: "Origem dos dados",
    options: [
      { value: "own", label: "Base própria" },
      { value: "niar", label: "Base do NIAR" },
    ],
  },
  argTypes: {
    label: {
      control: "text",
      description: "Rótulo do grupo de opções.",
      table: { category: "PROPS" },
    },
    options: {
      control: "object",
      description: "Opções com value, label e disabled opcional.",
      table: { category: "PROPS" },
    },
    row: {
      control: "boolean",
      description: "Organiza as opções horizontalmente quando true.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    defaultValue: {
      control: "text",
      description: "Valor selecionado inicialmente.",
      table: { category: "PROPS" },
    },
    onChange: {
      action: "changed",
      description: "Callback do MUI ao selecionar uma opção.",
      table: { category: "EVENTS" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Grupo de opções mutuamente exclusivas com rótulos acessíveis.",
      },
      source: {
        code: '<RadioGroup label="Origem dos dados" options={[{ value: "own", label: "Base própria" }, { value: "niar", label: "Base do NIAR" }]} />',
      },
    },
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Configure o rótulo e as opções do grupo." },
    },
  },
};
export const Selected: Story = {
  args: { defaultValue: "own" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Inicia o grupo com a opção Base própria selecionada.",
      },
      source: {
        code: '<RadioGroup label="Origem dos dados" defaultValue="own" options={[{ value: "own", label: "Base própria" }, { value: "niar", label: "Base do NIAR" }]} />',
      },
    },
  },
};

export const Row: Story = {
  args: { row: true },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Apresenta as opções lado a lado." },
      source: {
        code: '<RadioGroup row label="Origem dos dados" options={[{ value: "own", label: "Base própria" }, { value: "niar", label: "Base do NIAR" }]} />',
      },
    },
  },
};
