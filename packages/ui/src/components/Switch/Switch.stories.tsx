import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Switch } from "./Switch";

const meta = {
  title: "Componentes/Switch",
  component: Switch,
  args: { label: "Ativar notificações", checked: false, disabled: false },
  argTypes: {
    label: {
      control: "text",
      description: "Rótulo associado ao switch.",
      table: { category: "PROPS" },
    },
    checked: {
      control: "boolean",
      description: "Controla se a opção está ativada.",
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
        "Evento do MUI disparado quando o usuário alterna o switch. O segundo argumento informa o novo valor booleano.",
      table: { category: "EVENTS" },
    },
  },
  parameters: {
    docs: {
      codePanel: true,
      description: {
        component: "Controle binário do MUI para ativar ou desativar uma configuração.",
      },
      source: { code: '<Switch label="Ativar notificações" />' },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveSwitch({
  label,
  initialChecked = false,
  disabled = false,
}: {
  label: string;
  initialChecked?: boolean;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);

  return (
    <Switch
      label={label}
      checked={checked}
      disabled={disabled}
      onChange={(_, nextChecked) => setChecked(nextChecked)}
    />
  );
}

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(Boolean(args.checked));

    return (
      <Switch
        {...args}
        checked={checked}
        onChange={(event, nextChecked) => {
          setChecked(nextChecked);
          args.onChange?.(event, nextChecked);
        }}
      />
    );
  },
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Use o playground para testar o rótulo e o estado controlado do switch." },
    },
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8 }}>
      <InteractiveSwitch label="Desativado" />
      <InteractiveSwitch label="Ativado" initialChecked />
      <Switch label="Indisponível" disabled />
      <Switch label="Indisponível ativado" checked disabled />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Exibe os estados padrão, ativado e indisponível." },
      source: { code: '<Switch label="Ativar notificações" checked />' },
    },
  },
};
