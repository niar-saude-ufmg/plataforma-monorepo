import type { Meta, StoryObj } from "@storybook/react-vite";
import { Snackbar } from "./Snackbar";

const meta = {
  title: "Componentes/Snackbar",
  component: Snackbar,
  args: {
    open: true,
    message: "Projeto salvo com sucesso.",
    severity: "success",
    variant: "standard",
    anchorOrigin: { vertical: "top", horizontal: "center" },
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Controla a visibilidade da mensagem.",
      table: { category: "PROPS" },
    },
    message: {
      control: "text",
      description: "Mensagem exibida para a pessoa usuária.",
      table: { category: "PROPS" },
    },
    severity: {
      control: "select",
      options: ["success", "info", "warning", "error"],
      description: "Define o significado semântico e a cor.",
      table: { category: "PROPS", defaultValue: { summary: "info" } },
    },
    variant: {
      control: "select",
      options: ["standard", "filled", "outlined"],
      description: "Define a aparência visual da mensagem, como no Alert.",
      table: { category: "PROPS", defaultValue: { summary: "standard" } },
    },
    anchorOrigin: {
      control: "object",
      description: "Define a posição do Snackbar na janela.",
      table: {
        category: "PROPS",
        defaultValue: { summary: "{ vertical: 'bottom', horizontal: 'left' }" },
      },
    },
    autoHideDuration: {
      control: "number",
      description: "Tempo, em milissegundos, até a mensagem desaparecer.",
      table: { category: "PROPS", defaultValue: { summary: "6000" } },
    },
    onClose: {
      action: "closed",
      description: "Callback executado ao fechar a mensagem.",
      table: { category: "EVENTS" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Mensagem temporária para comunicar o resultado de uma ação.",
      },
      source: {
        code: '<Snackbar open message="Projeto salvo com sucesso." severity="success" />',
      },
    },
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [
    (Story) => (
      <div style={{ minHeight: 220, width: 420 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Configure a mensagem, severity e posição no playground.",
      },
    },
  },
};

export const Severities: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Compara as quatro severities, apresentadas uma abaixo da outra.",
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["success", "info", "warning", "error"] as const).map((severity) => (
        <Snackbar
          key={severity}
          open
          message={`Mensagem de ${severity}`}
          severity={severity}
          sx={{ position: "static", transform: "none" }}
        />
      ))}
    </div>
  ),
};
