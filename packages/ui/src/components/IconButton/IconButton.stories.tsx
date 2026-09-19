import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "./IconButton";
const meta = {
  title: "Componentes/IconButton",
  component: IconButton,
  args: { name: "close", "aria-label": "Fechar" },
  argTypes: {
    name: {
      control: "select",
      options: ["close", "visibility", "edit", "delete", "moreVert"],
      description: "Nome do ícone exibido no botão.",
      table: { category: "PROPS" },
    },
    "aria-label": {
      control: "text",
      description: "Nome acessível da ação.",
      table: { category: "PROPS" },
    },
    onClick: {
      action: "clicked",
      description: "Callback executado ao ativar o botão.",
      table: { category: "EVENTS" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: "Botão compacto que usa um ícone para representar uma ação.",
      },
      source: { code: '<IconButton name="close" aria-label="Fechar" />' },
    },
  },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Escolha o ícone e o nome acessível da ação." },
    },
  },
};
export const Actions: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Exemplos de ações representadas por ícones." },
      source: {
        code: '<IconButton name="close" aria-label="Fechar" />\n<IconButton name="visibility" aria-label="Mostrar senha" />',
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <IconButton name="close" aria-label="Fechar" />
      <IconButton name="visibility" aria-label="Mostrar senha" />
    </div>
  ),
};
