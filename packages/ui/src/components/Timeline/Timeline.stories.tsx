import type { Meta, StoryObj } from "@storybook/react-vite";
import { Timeline } from "./Timeline";

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
const meta = {
  title: "Componentes/Timeline",
  component: Timeline,
  args: { items },
  argTypes: {
    items: {
      control: "object",
      description:
        "Eventos em ordem cronológica com title, description, date e color.",
      table: { category: "PROPS" },
    },
    "aria-label": {
      control: "text",
      description: "Nome acessível da linha do tempo.",
      table: {
        category: "ACCESSIBILITY",
        defaultValue: { summary: "Linha do tempo" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Linha do tempo para exibir o histórico de mudanças de um projeto.",
      },
      source: {
        code: '<Timeline items={[{ title: "Projeto submetido", date: "Hoje, 10:30" }]} />',
      },
    },
  },
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Configure os eventos e suas cores no playground.",
      },
    },
  },
};
export const Compact: Story = {
  args: {
    items: items.map(({ title, date, color }) => ({ title, date, color })),
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Versão compacta sem descrições nos eventos." },
      source: {
        code: '<Timeline items={[{ title: "Projeto submetido", date: "Hoje, 10:30" }, { title: "Em análise", date: "Hoje, 11:15", color: "secondary" }]} />',
      },
    },
  },
};

export const Colors: Story = {
  args: {
    items: [
      { title: "Primary", color: "primary" },
      { title: "Secondary", color: "secondary" },
      { title: "Success", color: "success" },
      { title: "Warning", color: "warning" },
      { title: "Error", color: "error" },
      { title: "Grey", color: "grey" },
    ],
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Apresenta as cores disponíveis para os marcadores dos eventos.",
      },
      source: {
        code: `<Timeline
  items={[
    { title: "Primary", color: "primary" },
    { title: "Success", color: "success" },
    { title: "Warning", color: "warning" },
    { title: "Error", color: "error" },
  ]}
/>`,
      },
    },
  },
};
