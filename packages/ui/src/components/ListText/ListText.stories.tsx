import type { Meta, StoryObj } from "@storybook/react-vite";
import { ListText } from "./ListText";

const meta = {
  title: "Componentes/ListText",
  component: ListText,
  argTypes: {
    items: {
      control: "object",
      description: "Pares de label e value exibidos em cada linha.",
      table: { category: "PROPS" },
    },
    dense: {
      control: "boolean",
      description: "Reduz o espaçamento vertical das linhas.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    dividers: {
      control: "boolean",
      description: "Exibe uma linha separadora entre os itens.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    layout: {
      control: "select",
      options: ["stacked", "inline"],
      description: "Define se label e value ficam empilhados ou lado a lado.",
      table: { category: "PROPS", defaultValue: { summary: "stacked" } },
    },
    "aria-label": {
      control: "text",
      description: "Nome acessível da lista de detalhes.",
      table: { category: "ACCESSIBILITY", defaultValue: { summary: "Detalhes" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Lista de pares label e valor para exibir detalhes de entidades.",
      },
      source: {
        code: '<ListText items={[{ label: "Status", value: "Em análise" }]} />',
      },
    },
  },
} satisfies Meta<typeof ListText>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { label: "Status", value: "Em análise" },
  { label: "Responsável", value: "Usuário NIAR" },
  { label: "Última atualização", value: "11 de setembro de 2026" },
];

export const Playground: Story = {
  args: { items },
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Use o playground para configurar densidade, divisores e layout.",
      },
    },
  },
};
export const Dense: Story = {
  args: { items, dense: true, dividers: true },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Linhas compactas com divisores ativos." },
      source: { code: "<ListText items={items} dense dividers />" },
    },
  },
};

export const Divider: Story = {
  args: { items },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Compara a lista sem divisores e com divisores." },
      source: {
        code: "<ListText items={items} />\n<ListText items={items} dividers />",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gap: 24,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      }}
    >
      <ListText items={items} />
      <ListText items={items} dividers />
    </div>
  ),
};

export const Layout: Story = {
  args: { items },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Compara os layouts stacked e inline, ambos com divisores.",
      },
      source: {
        code: '<ListText items={items} layout="stacked" dividers />\n<ListText items={items} layout="inline" dividers />',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gap: 24,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      }}
    >
      <ListText items={items} layout="stacked" dividers />
      <ListText items={items} layout="inline" dividers />
    </div>
  ),
};
