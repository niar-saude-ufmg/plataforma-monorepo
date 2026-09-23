import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Componentes/Input",
  component: Input,
  args: {
    label: "Nome",
    type: "text",
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
    type: {
      control: "select",
      options: ["text", "email", "password"],
      description: "Tipo de valor aceito pelo campo.",
      table: { category: "PROPS", defaultValue: { summary: "text" } },
    },
    showPasswordLabel: { control: "text", description: "Label acessível para exibir a senha.", table: { category: "ACCESSIBILITY", defaultValue: { summary: "Mostrar senha" } } },
    hidePasswordLabel: { control: "text", description: "Label acessível para ocultar a senha.", table: { category: "ACCESSIBILITY", defaultValue: { summary: "Ocultar senha" } } },
    error: {
      control: "boolean",
      description: "Indica que o valor precisa de correção.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    helperText: {
      control: "text",
      description: "Mensagem auxiliar ou de validação exibida abaixo do campo.",
      table: { category: "PROPS" },
    },
    required: {
      control: "boolean",
      description: "Indica que o preenchimento é obrigatório.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Impede edição e interação.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    onChange: {
      action: "changed",
      description:
        "Callback do MUI ao alterar o valor; recebe ChangeEvent<HTMLInputElement>.",
      table: { category: "EVENTS" },
    },
    onFocus: {
      action: "focused",
      description:
        "Callback do MUI executado quando o campo recebe foco; recebe FocusEvent<HTMLInputElement>.",
      table: { category: "EVENTS" },
    },
    onBlur: {
      action: "blurred",
      description:
        "Callback do MUI executado quando o campo perde foco; recebe FocusEvent<HTMLInputElement>.",
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
          "Campo outlined de texto, e-mail ou senha, com altura única e controle de visibilidade da senha.",
      },
      source: { code: '<Input label="Nome" />' },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Configure o rótulo, tipo e estado do campo no playground.",
      },
    },
  },
};
export const Email: Story = {
  args: { label: "E-mail", type: "email", autoComplete: "email" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Campo para endereço de e-mail com autocomplete semântico.",
      },
      source: {
        code: '<Input label="E-mail" type="email" autoComplete="email" />',
      },
    },
  },
};
export const Password: Story = {
  args: { label: "Senha", type: "password", autoComplete: "current-password" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Campo de senha com botão para alternar a visibilidade do valor.",
      },
      source: {
        code: '<Input label="Senha" type="password" autoComplete="current-password" />',
      },
    },
  },
};
export const Filled: Story = {
  args: { defaultValue: "Maria Silva" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Campo exibido com um valor inicial." },
      source: { code: '<Input label="Nome" defaultValue="Maria Silva" />' },
    },
  },
};
export const Error: Story = {
  args: { error: true, helperText: "Este campo é obrigatório." },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Campo com mensagem de validação para um valor inválido ou ausente.",
      },
      source: {
        code: '<Input label="Nome" error helperText="Este campo é obrigatório." />',
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
      description: { story: "Campo indisponível para edição." },
      source: { code: '<Input label="Nome" disabled />' },
    },
  },
};
