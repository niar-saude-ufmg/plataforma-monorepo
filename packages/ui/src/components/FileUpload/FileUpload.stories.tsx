import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpload } from "./FileUpload";
const meta = {
  title: "Componentes/FileUpload",
  component: FileUpload,
  args: { label: "Selecionar documento", accept: ".pdf,.doc,.docx" },
  argTypes: {
    label: {
      control: "text",
      description: "Rótulo do botão de seleção.",
      table: { category: "PROPS" },
    },
    description: {
      control: "text",
      description: "Texto de orientação exibido na área de arraste e seleção.",
      table: {
        category: "PROPS",
        defaultValue: {
          summary: "Arraste um arquivo ou selecione no seu dispositivo",
        },
      },
    },
    accept: {
      control: "text",
      description: "Tipos de arquivo aceitos pelo input nativo.",
      table: { category: "PROPS" },
    },
    multiple: {
      control: "boolean",
      description: "Permite selecionar mais de um arquivo.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita seleção e arraste de arquivos.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    onChange: {
      action: "changed",
      description: "Callback com a lista atualizada de arquivos.",
      table: { category: "EVENTS" },
    },
    onRemove: {
      action: "removed",
      description: "Callback executado ao remover um arquivo.",
      table: { category: "EVENTS" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Área para selecionar ou arrastar arquivos, exibindo os arquivos escolhidos e permitindo removê-los.",
      },
      source: {
        code: '<FileUpload label="Selecionar documento" accept=".pdf,.doc,.docx" />',
      },
    },
  },
} satisfies Meta<typeof FileUpload>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Selecione ou arraste um arquivo para visualizar a lista de arquivos escolhidos.",
      },
    },
  },
};
export const Multiple: Story = {
  args: { multiple: true, label: "Selecionar documentos" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Permite adicionar vários arquivos à lista." },
      source: { code: '<FileUpload multiple label="Selecionar documentos" />' },
    },
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Impede seleção e arraste enquanto o envio não estiver disponível.",
      },
      source: { code: "<FileUpload disabled />" },
    },
  },
};
