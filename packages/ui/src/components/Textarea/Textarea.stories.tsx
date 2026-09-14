import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Componentes/Textarea",
  component: Textarea,
  args: { label: "Descrição do projeto", fullWidth: true },
  argTypes: {
    label: {
      control: "text",
      description: "Rótulo visível do campo.",
      table: { category: "PROPS" },
    },
    minRows: {
      control: "number",
      description: "Quantidade mínima de linhas exibidas.",
      table: { category: "PROPS", defaultValue: { summary: "4" } },
    },
    error: {
      control: "boolean",
      description: "Indica que o valor precisa de correção.",
      table: { category: "PROPS" },
    },
    helperText: {
      control: "text",
      description: "Mensagem auxiliar ou de validação.",
      table: { category: "PROPS" },
    },
    disabled: {
      control: "boolean",
      description: "Impede edição e interação.",
      table: { category: "PROPS" },
    },
    onChange: {
      action: "changed",
      description: "Callback do MUI ao alterar o texto.",
      table: { category: "EVENTS" },
    },
    onFocus: {
      action: "focused",
      description: "Callback executado ao receber foco.",
      table: { category: "EVENTS" },
    },
    onBlur: {
      action: "blurred",
      description: "Callback executado ao perder foco.",
      table: { category: "EVENTS" },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: "Campo multiline outlined para textos longos.",
      },
      source: { code: '<Textarea label="Descrição do projeto" />' },
    },
  },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Configure o rótulo, estado e mensagens do campo.",
      },
    },
  },
};
export const Error: Story = {
  args: { error: true, helperText: "Informe a descrição." },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Campo com mensagem de validação." },
      source: {
        code: '<Textarea label="Descrição do projeto" error helperText="Informe a descrição." />',
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
      source: { code: '<Textarea label="Descrição do projeto" disabled />' },
    },
  },
};
