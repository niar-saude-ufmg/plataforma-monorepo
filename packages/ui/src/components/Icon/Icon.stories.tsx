import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon, type IconName } from "./Icon";

const iconNames: IconName[] = [
  "inbox",
  "check",
  "info",
  "warning",
  "error",
  "search",
];
const colors = [
  "inherit",
  "primary",
  "secondary",
  "action",
  "error",
  "disabled",
] as const;

const meta = {
  title: "Componentes/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: { name: "inbox" as IconName },
  argTypes: {
    name: { control: "select", options: iconNames },
    color: { control: "select", options: colors },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Ícones principais usados pela plataforma. Para consultar o catálogo completo, acesse a documentação do [Material Icons](https://mui.com/material-ui/material-icons/).",
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Principais: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      {iconNames.map((name) => (
        <Icon key={name} name={name} titleAccess={name} />
      ))}
    </div>
  ),
};

export const Colors: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      {colors.map((color) => (
        <Icon key={color} name="info" color={color} titleAccess={color} />
      ))}
    </div>
  ),
};
