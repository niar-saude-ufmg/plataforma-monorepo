import type { Meta, StoryObj } from "@storybook/react-vite";
import { ListText } from "./ListText";

const meta = {
  title: "Componentes/ListText",
  component: ListText,
  tags: ["autodocs"],
  parameters: { docs: { codePanel: true } },
} satisfies Meta<typeof ListText>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { label: "Status", value: "Em análise" },
  { label: "Responsável", value: "Usuário NIAR" },
  { label: "Última atualização", value: "11 de setembro de 2026" },
];

export const Playground: Story = { args: { items } };
export const Dense: Story = { args: { items, dense: true, dividers: true } };

export const Divider: Story = {
  args: { items },
  parameters: { controls: { disable: true } },
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
  parameters: { controls: { disable: true } },
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
