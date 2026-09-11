import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../Icon/Icon";
import { Sidebar } from "./Sidebar";

const meta = {
  title: "Componentes/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { docs: { codePanel: true } },
  decorators: [
    (Story) => (
      <div style={{ height: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIcons: Story = {
  args: {
    variant: "permanent",
    items: [
      { label: "Início", icon: <Icon name="home" />, selected: true },
      { label: "Meus projetos", icon: <Icon name="folder" /> },
      { label: "Documentos", icon: <Icon name="description" /> },
      { label: "Configurações", icon: <Icon name="settings" /> },
      { label: "Ajuda", icon: <Icon name="search" /> },
    ],
  },
};

export const WithoutIcons: Story = {
  args: {
    variant: "permanent",
    items: [
      { label: "Início", selected: true },
      { label: "Meus projetos" },
      { label: "Documentos" },
      { label: "Configurações" },
      { label: "Ajuda" },
    ],
  },
};
