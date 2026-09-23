import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu } from "./Menu";

const meta = {
  title: "Componentes/Menu",
  component: Menu,
  argTypes: {
    groups: {
      control: "object",
      description: "Grupos com label e itens de ação ou navegação.",
      table: { category: "PROPS" },
    },
  },
  parameters: { docs: { codePanel: true } },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    groups: [
      {
        label: "Arquivo",
        items: [{ label: "Novo projeto" }, { label: "Abrir" }],
      },
      { label: "Ajuda", items: [{ label: "Documentação" }] },
    ],
  },
};
