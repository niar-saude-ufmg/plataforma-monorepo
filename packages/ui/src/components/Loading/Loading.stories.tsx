import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loading } from "./Loading";

const meta = {
  title: "Componentes/Loading",
  component: Loading,
  args: { variant: "circular" },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["circular", "linear"],
      description: "Define o formato do indicador.",
      table: { category: "PROPS", defaultValue: { summary: "circular" } },
    },
    size: {
      control: "number",
      description: "Diâmetro do indicador circular em pixels.",
      table: { category: "PROPS", defaultValue: { summary: "28" } },
    },
    value: {
      control: "number",
      description:
        "Percentual para o progresso linear determinado; sem valor, o progresso é indeterminado.",
      table: { category: "PROPS" },
    },
    "aria-label": {
      control: "text",
      description: "Nome acessível do indicador para tecnologias assistivas.",
      table: { category: "PROPS", defaultValue: { summary: "Carregando" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Indicador visual de carregamento circular ou linear, sem texto embutido.",
      },
      source: { code: '<Loading variant="circular" />' },
    },
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Escolha o formato e, no modo linear, informe um valor determinado.",
      },
    },
  },
};

export const Circular: Story = {
  args: { variant: "circular", size: 32 },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Indicador circular para operações em andamento." },
      source: { code: '<Loading variant="circular" size={32} />' },
    },
  },
};

export const Linear: Story = {
  args: { variant: "linear" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Indicador linear indeterminado quando a duração não é conhecida.",
      },
      source: { code: '<Loading variant="linear" />' },
    },
  },
};

export const LinearDeterminate: Story = {
  args: { variant: "linear", value: 60 },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Indicador linear determinado para progresso conhecido.",
      },
      source: { code: '<Loading variant="linear" value={60} />' },
    },
  },
};
