import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./Alert";

const meta = {
  title: "Componentes/Alert",
  component: Alert,
  args: { children: "Mensagem para a pessoa usuária." },
  argTypes: {
    severity: {
      control: "select",
      options: ["error", "warning", "info", "success"],
      description: "Define o nível semântico da mensagem e sua cor associada.",
      table: { category: "PROPS", defaultValue: { summary: "info" } },
    },
    variant: { control: "select", options: ["standard", "filled", "outlined"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Mensagem persistente para comunicar sucesso, aviso, erro ou informação.",
      },
      source: { code: '<Alert severity="info">Mensagem informativa.</Alert>' },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Use o Alert para comunicar uma mensagem persistente relacionada ao estado de uma operação.",
      },
    },
  },
};
export const Success: Story = {
  args: { severity: "success", children: "Projeto salvo com sucesso." },
};
export const Error: Story = {
  args: {
    severity: "error",
    children: "Não foi possível concluir a operação.",
  },
};
export const Warning: Story = {
  args: { severity: "warning", children: "Revise os campos obrigatórios." },
};
export const Info: Story = {
  args: {
    severity: "info",
    children: "A análise do projeto está em andamento.",
  },
};
