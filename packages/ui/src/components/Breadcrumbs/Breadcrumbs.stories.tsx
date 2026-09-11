import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs } from "./Breadcrumbs";

const meta = {
  title: "Componentes/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  parameters: { docs: { codePanel: true } },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  args: {
    items: [
      { label: "Início", href: "#" },
      { label: "Projetos", href: "#" },
      { label: "Detalhes" },
    ],
  },
};
