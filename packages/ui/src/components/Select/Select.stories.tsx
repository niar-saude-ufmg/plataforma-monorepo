import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const meta = {
  title: "Componentes/Select",
  component: Select,
  args: {
    label: "Tipo de projeto",
    options: [
      { value: "", label: "Selecione uma opção" },
      { value: "own", label: "Base própria" },
      { value: "niar", label: "Base do NIAR" },
    ],
    defaultValue: "",
    disabled: false,
    error: false,
    required: false,
    fullWidth: true,
  },
  argTypes: {
    label: {
      control: "text",
      description: "Rótulo visível do campo.",
      table: { category: "PROPS" },
    },
    options: {
      control: "object",
      description: "Opções com value, label e disabled opcional.",
      table: { category: "PROPS" },
    },
    defaultValue: {
      control: "text",
      description: "Valor selecionado inicialmente.",
      table: { category: "PROPS" },
    },
    error: {
      control: "boolean",
      description: "Indica que o valor precisa de correção.",
      table: { category: "PROPS" },
    },
    disabled: {
      control: "boolean",
      description: "Impede interação com o campo.",
      table: { category: "PROPS" },
    },
    onChange: {
      action: "changed",
      description: "Callback do MUI ao selecionar uma opção.",
      table: { category: "EVENTS" },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Seleção simples nativa com o mesmo estilo outlined e altura do Input.",
      },
      source: {
        code: '<Select label="Tipo de projeto" options={[{ value: "own", label: "Base própria" }, { value: "niar", label: "Base do NIAR" }]} />',
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Configure o rótulo, as opções e o estado do campo.",
      },
    },
  },
};

export const Filled: Story = {
  args: { defaultValue: "own" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Exibe uma opção selecionada inicialmente." },
      source: {
        code: '<Select label="Tipo de projeto" defaultValue="own" options={[{ value: "own", label: "Base própria" }, { value: "niar", label: "Base do NIAR" }]} />',
      },
    },
  },
};
export const Error: Story = {
  args: { error: true, helperText: "Este campo é obrigatório." },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Exibe uma mensagem de validação." },
      source: {
        code: '<Select label="Tipo de projeto" error helperText="Este campo é obrigatório." options={[]} />',
      },
    },
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Campo indisponível para interação." },
      source: {
        code: '<Select label="Tipo de projeto" disabled options={[]} />',
      },
    },
  },
};
