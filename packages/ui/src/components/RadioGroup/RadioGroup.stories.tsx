import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "./RadioGroup";
const meta = {
  title: "Componentes/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: {
    label: "Origem dos dados",
    options: [
      { value: "own", label: "Base própria" },
      { value: "niar", label: "Base do NIAR" },
    ],
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Selected: Story = { args: { defaultValue: "own" } };
