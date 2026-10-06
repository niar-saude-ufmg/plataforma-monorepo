import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "Componentes/DatePicker",
  component: DatePicker,
  args: {
    label: "Data de aprovação",
    disabled: false,
    error: false,
    required: false,
    fullWidth: true,
  },
  argTypes: {
    label: { control: "text", description: "Rótulo visível do campo.", table: { category: "PROPS" } },
    fullWidth: { control: "boolean", description: "Ocupa toda a largura disponível.", table: { category: "PROPS", defaultValue: { summary: "false" } } },
    defaultValue: { control: "text", description: "Valor inicial no formato YYYY-MM-DD.", table: { category: "PROPS" } },
    error: { control: "boolean", description: "Indica que o valor precisa de correção.", table: { category: "PROPS" } },
    helperText: { control: "text", description: "Mensagem auxiliar ou de validação.", table: { category: "PROPS" } },
    required: { control: "boolean", description: "Indica que o preenchimento é obrigatório.", table: { category: "PROPS" } },
    disabled: { control: "boolean", description: "Impede edição e interação.", table: { category: "PROPS" } },
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component: "Campo de data com label retraído para não sobrepor o placeholder nativo do navegador.",
      },
      source: { code: '<DatePicker label="Data de aprovação" />' },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    docs: { canvas: { sourceState: "shown" }, description: { story: "Configure o rótulo e os estados do campo de data." } },
  },
};

export const Filled: Story = {
  args: { defaultValue: "2026-09-25" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Campo exibido com uma data inicial." },
      source: { code: '<DatePicker label="Data de aprovação" defaultValue="2026-09-25" />' },
    },
  },
};
