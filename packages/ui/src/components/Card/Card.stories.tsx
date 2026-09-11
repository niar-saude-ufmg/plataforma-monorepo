import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta = {
  title: "Componentes/Card",
  component: Card,
  tags: ["autodocs"],
  args: { children: "Conteúdo do card", variant: "elevation" },
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
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Project: Story = {
  args: {
    children: (
      <>
        <strong>Projeto de pesquisa</strong>
        <p>Estudo sobre saúde pública</p>
      </>
    ),
  },
};
export const Variants: Story = {
  parameters: { controls: { disable: true } },
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
