import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon, type IconName } from "./Icon";

const iconNames: IconName[] = [
  "menu",
  "close",
  "check",
  "add",
  "edit",
  "delete",
  "search",
  "filter",
  "moreVert",
  "settings",
  "person",
  "logout",
  "home",
  "dashboard",
  "folder",
  "description",
  "uploadFile",
  "download",
  "visibility",
  "visibilityOff",
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
  args: { name: "menu" as IconName },
  argTypes: {
    name: {
      control: "select",
      options: iconNames,
      description: "Nome do ícone do catálogo NIAR.",
      table: { category: "PROPS" },
    },
    color: {
      control: "select",
      options: colors,
      description: "Cor semântica do ícone conforme o tema MUI.",
      table: { category: "PROPS", defaultValue: { summary: "inherit" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Ícones principais usados pela plataforma. Para consultar o catálogo completo, acesse a documentação do [Material Icons](https://mui.com/material-ui/material-icons/).",
      },
      source: { code: '<Icon name="search" color="primary" />' },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Selecione um ícone e uma cor no playground." },
    },
  },
};

export const Icons: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Catálogo dos ícones principais disponíveis pelo nome.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(80px, 1fr))",
        gap: 20,
        alignItems: "center",
      }}
    >
      {iconNames.map((name) => (
        <div
          key={name}
          style={{
            display: "grid",
            gap: 6,
            justifyItems: "center",
            fontSize: 11,
          }}
        >
          <Icon name={name} titleAccess={name} />
          <span>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Compara as cores semânticas disponíveis para os ícones.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      {colors.map((color) => (
        <Icon key={color} name="search" color={color} titleAccess={color} />
      ))}
    </div>
  ),
};
