import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";
const meta = {
  title: "Componentes/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { label: "Descrição do projeto", fullWidth: true },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Error: Story = {
  args: { error: true, helperText: "Informe a descrição." },
};
export const Disabled: Story = { args: { disabled: true } };
