import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "./Pagination";

const meta = {
  title: "Componentes/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  args: { count: 10, color: "primary", size: "medium" },
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "secondary", "standard"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
  },
  parameters: {
    docs: {
      codePanel: true,
      description: {
        component: "Navegação entre páginas baseada no Pagination do MUI.",
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Pagination count={5} color="primary" />
      <Pagination count={5} color="secondary" />
      <Pagination count={5} color="standard" />
    </div>
  ),
  parameters: { controls: { disable: true }, docs: { description: { story: "Cores disponíveis para a navegação." } } },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Pagination count={5} size="small" />
      <Pagination count={5} size="medium" />
      <Pagination count={5} size="large" />
    </div>
  ),
  parameters: { controls: { disable: true }, docs: { description: { story: "Tamanhos disponíveis para a navegação." } } },
};
