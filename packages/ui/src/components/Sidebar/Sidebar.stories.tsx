import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../Icon/Icon";
import { Sidebar } from "./Sidebar";

const meta = {
  title: "Componentes/Sidebar",
  component: Sidebar,
  argTypes: {
    items: {
      control: "object",
      description: "Itens de navegação com label, ícone e estados opcionais.",
      table: { category: "PROPS" },
    },
    open: {
      control: "boolean",
      description: "Controla a abertura do Drawer.",
      table: { category: "PROPS", defaultValue: { summary: "true" } },
    },
    variant: {
      control: "select",
      options: ["permanent", "persistent", "temporary"],
      description: "Define o comportamento do Drawer.",
      table: { category: "PROPS", defaultValue: { summary: "temporary" } },
    },
    width: {
      control: "number",
      description: "Largura do painel em pixels.",
      table: { category: "PROPS", defaultValue: { summary: "280" } },
    },
    onClose: {
      action: "closed",
      description: "Callback executado ao fechar o Drawer.",
      table: { category: "EVENTS" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Navegação lateral baseada no Drawer do MUI, com suporte a ícones e estados.",
      },
      source: {
        code: '<Sidebar variant="permanent" items={[{ label: "Início", selected: true }, { label: "Projetos" }]} />',
      },
    },
  },
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
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Navegação com os ícones principais do componente Icon.",
      },
      source: {
        code: '<Sidebar variant="permanent" items={[{ label: "Início", icon: <Icon name="home" />, selected: true }, { label: "Meus projetos", icon: <Icon name="folder" /> }]} />',
      },
    },
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
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Navegação somente com texto, sem ícones nos itens.",
      },
      source: {
        code: '<Sidebar variant="permanent" items={[{ label: "Início", selected: true }, { label: "Meus projetos" }]} />',
      },
    },
  },
};
