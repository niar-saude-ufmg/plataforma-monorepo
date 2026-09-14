import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";
const meta = {
  title: "Componentes/Checkbox",
  component: Checkbox,
  args: { label: "Aceito os termos de uso" },
  argTypes: {
    label: {
      control: "text",
      description: "Rótulo associado ao checkbox.",
      table: { category: "PROPS" },
    },
    checked: {
      control: "boolean",
      description: "Controla se o checkbox está marcado.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Impede a alteração do valor.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    onChange: {
      action: "changed",
      description:
        "Callback do MUI ao alterar o valor; recebe ChangeEvent<HTMLInputElement> e checked.",
      table: { category: "EVENTS" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: "Controle booleano para selecionar ou desmarcar uma opção.",
      },
      source: { code: '<Checkbox label="Aceito os termos de uso" />' },
    },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Use o playground para testar o rótulo e o estado do checkbox.",
      },
    },
  },
};
export const Checked: Story = {
  args: { checked: true },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Exibe o checkbox já selecionado." },
      source: { code: '<Checkbox label="Aceito os termos de uso" checked />' },
    },
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Exibe o checkbox indisponível para interação." },
      source: { code: '<Checkbox label="Aceito os termos de uso" disabled />' },
    },
  },
};
