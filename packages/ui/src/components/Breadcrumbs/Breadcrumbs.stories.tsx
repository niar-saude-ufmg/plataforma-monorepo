import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs } from "./Breadcrumbs";

const meta = {
  title: "Componentes/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    items: [
      { label: "Início", href: "#" },
      { label: "Projetos", href: "#" },
      { label: "Detalhes" },
    ],
    "aria-label": "Navegação estrutural",
  },
  argTypes: {
    items: {
      control: "object",
      description:
        "Itens exibidos na sequência de navegação; o último item é tratado como a página atual.",
      table: { category: "PROPS", defaultValue: { summary: "[]" } },
    },
    "aria-label": {
      control: "text",
      description:
        "Nome acessível da região de navegação estrutural, usado por tecnologias assistivas.",
      table: {
        category: "PROPS",
        defaultValue: { summary: "Navegação estrutural" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Navegação estrutural que mostra o caminho até a página atual e diferencia o último item dos links anteriores.",
      },
      source: {
        code: `<Breadcrumbs
  items={[
    { label: "Início", href: "/" },
    { label: "Projetos", href: "/projetos" },
    { label: "Detalhes" },
  ]}
/>`,
      },
    },
  },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Use o Breadcrumbs para indicar a posição da página atual dentro da hierarquia de navegação.",
      },
    },
  },
};
