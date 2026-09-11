import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "./Tabs";
const meta = {
  title: "Componentes/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: {
    defaultValue: "overview",
    options: [
      { value: "overview", label: "Visão geral" },
      { value: "documents", label: "Documentos" },
    ],
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
