import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Componentes/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: { variant: "text", lines: 3, height: 20 },
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "rectangular", "rounded", "circular"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Text: Story = { args: { variant: "text", lines: 3 } };
export const Rectangular: Story = {
  args: { variant: "rectangular", lines: 1, height: 160 },
};
export const Rounded: Story = {
  args: { variant: "rounded", lines: 2, height: 80 },
};
export const Circular: Story = {
  args: { variant: "circular", lines: 1, height: 64 },
};
