import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@mui/material/Button";
import { EmptyState } from "./EmptyState";
const meta = {
  title: "Componentes/EmptyState",
  component: EmptyState,
  args: {
    title: "Nenhum projeto encontrado",
    description: "Crie um projeto para começar.",
    icon: "inbox",
  },
  argTypes: {
    "aria-level": {
      control: "number",
      description: "Nível semântico do título para manter a hierarquia de headings.",
      table: { category: "ACCESSIBILITY", defaultValue: { summary: "3" } },
    },
    icon: {
      control: "select",
      options: ["inbox", "check", "info", "warning", "error", "search"],
      description: "Ícone que contextualiza o estado vazio.",
      table: { category: "PROPS", defaultValue: { summary: "folder" } },
    },
    title: {
      control: "text",
      description: "Título principal do estado vazio.",
      table: { category: "PROPS" },
    },
    description: {
      control: "text",
      description: "Explicação opcional do estado.",
      table: { category: "PROPS" },
    },
    action: {
      description: "Ação opcional para orientar o próximo passo.",
      table: { category: "PROPS" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Mensagem de orientação exibida quando não há conteúdo para apresentar.",
      },
      source: {
        code: '<EmptyState title="Nenhum projeto encontrado" description="Crie um projeto para começar." icon="inbox" />',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Use o playground para configurar o título, a descrição e o ícone do estado vazio.",
      },
    },
  },
};
export const WithAction: Story = {
  args: { action: <Button variant="contained">Criar projeto</Button> },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Inclui uma ação para orientar a pessoa usuária quando não há conteúdo.",
      },
      source: {
        code: '<EmptyState title="Nenhum projeto encontrado" action={<Button variant="contained">Criar projeto</Button>} />',
      },
    },
  },
};
