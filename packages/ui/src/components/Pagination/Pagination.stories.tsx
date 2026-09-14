import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "./Pagination";

const meta = {
  title: "Componentes/Pagination",
  component: Pagination,
  args: { count: 10, color: "primary", size: "medium" },
  argTypes: {
    count: {
      description: "Quantidade total de páginas disponíveis para navegação.",
      table: { category: "PROPS", type: { summary: "number" }, defaultValue: { summary: "1" } },
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "standard"],
      description: "Cor dos itens e dos estados ativo e de foco da paginação.",
      table: { category: "PROPS", type: { summary: "primary | secondary | standard" }, defaultValue: { summary: "primary" } },
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "Tamanho dos itens de navegação.",
      table: { category: "PROPS", type: { summary: "small | medium | large" }, defaultValue: { summary: "medium" } },
    },
    onChange: {
      description: "Callback chamado quando a pessoa usuária seleciona uma página.",
      control: false,
      table: {
        category: "EVENTS",
        type: { summary: "(event, page) => void" },
      },
    },
  },
  parameters: {
    docs: {
      codePanel: true,
      description: {
        component: "Navegação entre páginas baseada no Pagination do MUI.",
      },
      source: { code: '<Pagination count={10} color="primary" size="medium" />' },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: { docs: { canvas: { sourceState: "shown" }, description: { story: "Explore as propriedades de quantidade, cor e tamanho no painel de controles." } } },
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Pagination count={5} color="primary" aria-label="Paginação primária" />
      <Pagination count={5} color="secondary" aria-label="Paginação secundária" />
      <Pagination count={5} color="standard" aria-label="Paginação padrão" />
    </div>
  ),
  parameters: { controls: { disable: true }, docs: { canvas: { sourceState: "shown" }, description: { story: "Cores disponíveis para a navegação." } } },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Pagination count={5} size="small" aria-label="Paginação pequena" />
      <Pagination count={5} size="medium" aria-label="Paginação média" />
      <Pagination count={5} size="large" aria-label="Paginação grande" />
    </div>
  ),
  parameters: { controls: { disable: true }, docs: { canvas: { sourceState: "shown" }, description: { story: "Tamanhos disponíveis para a navegação." } } },
};
