import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "./Tabs";

const meta = {
  title: "Componentes/Tabs",
  component: Tabs,
  args: {
    defaultValue: "overview",
    options: [
      { value: "overview", label: "Visão geral" },
      { value: "documents", label: "Documentos" },
    ],
  },
  argTypes: {
    options: {
      control: "object",
      description: "Abas com value, label e disabled opcional.",
      table: { category: "PROPS" },
    },
    value: {
      control: "text",
      description: "Valor controlado da aba ativa.",
      table: { category: "PROPS" },
    },
    defaultValue: {
      control: "text",
      description: "Valor inicial quando o componente é não controlado.",
      table: { category: "PROPS" },
    },
    "aria-label": {
      control: "text",
      description: "Nome acessível da navegação por abas.",
      table: {
        category: "ACCESSIBILITY",
        defaultValue: { summary: "Navegação por abas" },
      },
    },
    onChange: {
      action: "changed",
      description:
        "Callback do MUI ao selecionar uma aba; recebe evento e value.",
      table: { category: "EVENTS" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Navegação por abas para alternar entre conteúdos relacionados.",
      },
      source: {
        code: '<Tabs defaultValue="overview" options={[{ value: "overview", label: "Visão geral" }, { value: "documents", label: "Documentos" }]} />',
      },
    },
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Clique nas abas para alternar o valor selecionado.",
      },
    },
  },
};
