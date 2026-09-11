import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loading } from "./Loading";

const meta = {
  title: "Componentes/Loading",
  component: Loading,
  tags: ["autodocs"],
  args: { variant: "circular" },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: { control: "select", options: ["circular", "linear"] },
    size: { control: "number" },
    value: { control: "number" },
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Circular: Story = {
  args: { variant: "circular", size: 32 },
};

export const Linear: Story = {
  args: { variant: "linear" },
};

export const LinearDeterminate: Story = {
  args: { variant: "linear", value: 60 },
};
