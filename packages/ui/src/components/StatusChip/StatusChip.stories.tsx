import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusChip } from "./StatusChip";
const meta = {
  title: "Componentes/StatusChip",
  component: StatusChip,
  args: { label: "Em análise", status: "info", display: "chip" },
  parameters: {
    docs: {
      source: { code: '<StatusChip status="success" label="Aprovado" />' },
      description: {
        component:
          'Indicador compacto para representar o estado de um projeto, usuário ou etapa do fluxo. Use status para aplicar a semântica visual e display="text" quando o espaço for reduzido.',
      },
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["default", "info", "success", "warning", "error"],
      description: "Define o estado semântico e a cor associada ao indicador.",
      table: {
        category: "PROPS",
        type: { summary: "default | info | success | warning | error" },
        defaultValue: { summary: "default" },
      },
    },
    display: {
      control: "select",
      options: ["chip", "text"],
      description:
        "Escolhe entre o indicador com fundo suave ou apenas o texto colorido para contextos compactos.",
      table: {
        category: "PROPS",
        type: { summary: "chip | text" },
        defaultValue: { summary: "chip" },
      },
    },
    label: {
      description:
        "Texto que comunica o estado para a pessoa usuária e para leitores de tela.",
      table: {
        category: "PROPS",
        type: { summary: "ReactNode" },
        defaultValue: { summary: "—" },
      },
    },
    size: {
      description: "Tamanho visual herdado do Chip do MUI.",
      control: "select",
      options: ["small", "medium"],
      table: {
        category: "PROPS",
        type: { summary: "small | medium" },
        defaultValue: { summary: "medium" },
      },
    },
  },
} satisfies Meta<typeof StatusChip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Altere status, display e size para avaliar as formas de apresentação do estado e escolher a combinação adequada para cada contexto.",
      },
      source: {
        code: '<StatusChip status="info" display="chip" label="Em análise" />',
      },
    },
  },
};
export const Display: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <StatusChip status="success" label="Chip" display="chip" />
      <StatusChip status="success" label="Texto" display="text" />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Compare a apresentação com fundo e a versão somente texto.",
      },
      source: {
        code: 'import { StatusChip } from "@niar/ui";\n\nexport function StatusExample() {\n  return (\n    <>\n      <StatusChip status="success" label="Chip" display="chip" />\n      <StatusChip status="success" label="Texto" display="text" />\n    </>\n  );\n}',
      },
    },
  },
};
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {(["default", "info", "success", "warning", "error"] as const).map(
        (status) => (
          <StatusChip key={status} status={status} label={status} />
        ),
      )}
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Mostra todos os estados semânticos disponíveis para uso no fluxo da plataforma.",
      },
      source: {
        code: 'import { StatusChip } from "@niar/ui";\n\nexport function StatusStates() {\n  return <StatusChip status="success" label="success" />;\n}',
      },
    },
  },
};
