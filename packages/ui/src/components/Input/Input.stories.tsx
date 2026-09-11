import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Componentes/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    label: "Nome",
    type: "text",
    disabled: false,
    error: false,
    required: false,
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Campo outlined de texto, e-mail ou senha, com altura única e controle de visibilidade da senha.",
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Email: Story = {
  args: { label: "E-mail", type: "email", autoComplete: "email" },
};
export const Password: Story = {
  args: { label: "Senha", type: "password", autoComplete: "current-password" },
};
export const Filled: Story = { args: { defaultValue: "Maria Silva" } };
export const Error: Story = {
  args: { error: true, helperText: "Este campo é obrigatório." },
};
export const Disabled: Story = { args: { disabled: true } };
