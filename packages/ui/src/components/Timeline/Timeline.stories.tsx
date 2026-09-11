import type { Meta, StoryObj } from "@storybook/react-vite";
import { Timeline } from "./Timeline";

const meta = {
  title: "Componentes/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: { docs: { codePanel: true } },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  {
    title: "Projeto submetido",
    description: "A submissão foi recebida pela comissão.",
    date: "Hoje, 10:30",
  },
  {
    title: "Em análise",
    description: "A equipe está avaliando os documentos.",
    date: "Hoje, 11:15",
    color: "secondary" as const,
  },
  {
    title: "Resultado disponível",
    date: "Próxima etapa",
    color: "grey" as const,
  },
];

export const Playground: Story = { args: { items } };
export const Compact: Story = {
  args: {
    items: items.map(({ title, date, color }) => ({ title, date, color })),
  },
};
