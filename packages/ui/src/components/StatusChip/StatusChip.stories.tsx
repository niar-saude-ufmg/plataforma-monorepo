import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusChip } from "./StatusChip";
const meta = {
  title: "Componentes/StatusChip",
  component: StatusChip,
  tags: ["autodocs"],
  args: { label: "Em análise", status: "info" },
  argTypes: {
    status: {
      control: "select",
      options: ["default", "info", "success", "warning", "error"],
    },
    display: {
      control: "select",
      options: ["chip", "text"],
    },
  },
} satisfies Meta<typeof StatusChip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Display: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <StatusChip status="success" label="Chip" display="chip" />
      <StatusChip status="success" label="Texto" display="text" />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Compare a apresentação com fundo e a versão somente texto." } },
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
};
