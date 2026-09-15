import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta = {
  title: "Componentes/Card",
  component: Card,
  args: { children: "Conteúdo do card", variant: "elevation" },
  argTypes: {
    variant: {
      control: "select",
      options: ["elevation", "outlined"],
      description: "Define a superfície do card.",
      table: { category: "PROPS", defaultValue: { summary: "elevation" } },
    },
    children: {
      control: "text",
      description: "Conteúdo agrupado dentro do card.",
      table: { category: "PROPS" },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Superfície para agrupar conteúdo relacionado em dashboards e formulários.",
      },
      source: { code: '<Card variant="elevation">Conteúdo do card</Card>' },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Use o playground para testar a superfície e o conteúdo do card.",
      },
    },
  },
};
export const Project: Story = {
  args: {
    children: (
      <>
        <strong>Projeto de pesquisa</strong>
        <p>Estudo sobre saúde pública</p>
      </>
    ),
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Exemplo de card com título e descrição de um projeto.",
      },
      source: {
        code: "<Card><strong>Projeto de pesquisa</strong><p>Estudo sobre saúde pública</p></Card>",
      },
    },
  },
};
export const Variants: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Compare as superfícies com elevação e contorno." },
      source: {
        code: '<Card variant="elevation">Elevation</Card>\n<Card variant="outlined">Outlined</Card>',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      }}
    >
      <Card variant="elevation">Elevation</Card>
      <Card variant="outlined">Outlined</Card>
    </div>
  ),
};
