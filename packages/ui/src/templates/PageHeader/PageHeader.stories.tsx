import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import { useState } from "react";
import { Avatar } from "../../components/Avatar/Avatar";
import { Icon } from "../../components/Icon/Icon";
import { PageHeader, type PageHeaderProps } from "./PageHeader";

const navigationOptions = [
  { value: "overview", label: "Visão geral", icon: "home" as const },
  { value: "projects", label: "Projetos", icon: "folder" as const },
  { value: "documents", label: "Documentos", icon: "description" as const },
];

const meta = {
  title: "Templates/PageHeader",
  component: PageHeader,
  parameters: { layout: "fullscreen", docs: { codePanel: true } },
  argTypes: {
    navigation: {
      control: "radio",
      options: ["sidebar", "menu", "tabs"],
      description:
        "Escolhe entre navegação lateral, MenuBar horizontal e abas no cabeçalho.",
      table: { category: "PROPS", defaultValue: { summary: "sidebar" } },
    },
    logo: {
      control: "boolean",
      description: "Exibe o logo padrão do NIAR.",
      table: { category: "PROPS", defaultValue: { summary: "true" } },
    },
    logoAlt: {
      control: "text",
      description: "Texto alternativo do logo para tecnologias assistivas.",
      table: { category: "PROPS", defaultValue: { summary: "NIAR" } },
    },
    logoHref: {
      control: "text",
      description: "Destino acionado ao clicar no logo.",
      table: { category: "PROPS", defaultValue: { summary: "/" } },
    },
    onLogoClick: {
      action: "logo clicked",
      description: "Evento executado ao clicar no logo.",
      table: { category: "EVENTS" },
    },
    sidebarItems: {
      control: "object",
      description:
        "Itens exibidos no Drawer quando navigation é sidebar, incluindo subitens.",
      table: { category: "PROPS" },
    },
    menuGroups: {
      control: "object",
      description:
        "Grupos e itens exibidos quando navigation é menu.",
      table: { category: "PROPS" },
    },
    avatar: {
      control: false,
      description:
        "Elemento React exibido no lado direito do cabeçalho para identificar a pessoa usuária. Use o componente Avatar para manter o padrão visual do NIAR.",
      table: { category: "PROPS" },
    },
    tabs: {
      control: "object",
      description: "Opções de abas exibidas quando navigation é tabs.",
      table: { category: "PROPS" },
    },
    tabsValue: {
      control: "text",
      description: "Valor controlado da aba selecionada.",
      table: { category: "PROPS" },
    },
    defaultTabsValue: {
      control: "text",
      description: "Valor inicial da aba selecionada.",
      table: { category: "PROPS" },
    },
    onChange: {
      action: "navigation changed",
      description: "Evento disparado ao trocar a navegação ativa.",
      table: { category: "EVENTS" },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    navigation: "sidebar",
    avatar: <Avatar alt="Usuário NIAR">UN</Avatar>,
    tabs: navigationOptions.map(({ value, label }) => ({ value, label })),
  },
  render: (args) => (
    <InteractivePage {...args} navigation={args.navigation ?? "sidebar"} />
  ),
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Template configurável com logo, avatar e uma das três opções de navegação. A story usa o mesmo conjunto de itens nas variantes Sidebar, MenuBar e Tabs para demonstrar a troca de conteúdo.",
      },
      source: { code: '<PageHeader navigation="sidebar" sidebarItems={items} />' },
    },
  },
};

export const SidebarNavigation: Story = {
  args: { ...Playground.args, navigation: "sidebar" },
  render: (args) => <InteractivePage {...args} navigation="sidebar" />,
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Página com Sidebar permanente lateral." },
      source: {
        code: `<PageHeader
  navigation="sidebar"
  sidebarItems={items}
  avatar={<Avatar alt="Usuário NIAR">UN</Avatar>}
/>`,
      },
    },
  },
};

export const MenuNavigation: Story = {
  args: { ...Playground.args, navigation: "menu" },
  render: (args) => <InteractivePage {...args} navigation="menu" />,
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Página com MenuBar horizontal no cabeçalho." },
      source: {
        code: `<PageHeader
  navigation="menu"
  menuGroups={groups}
  avatar={<Avatar alt="Usuário NIAR">UN</Avatar>}
/>`,
      },
    },
  },
};

export const TabsNavigation: Story = {
  args: { ...Playground.args, navigation: "tabs" },
  render: (args) => <InteractivePage {...args} navigation="tabs" />,
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Página com abas no cabeçalho para navegação horizontal." },
      source: {
        code: `<PageHeader
  navigation="tabs"
  tabs={[{ value: "overview", label: "Visão geral" }]}
  avatar={<Avatar alt="Usuário NIAR">UN</Avatar>}
/>`,
      },
    },
  },
};

function InteractivePage({
  navigation,
  logo,
  logoAlt,
  logoHref,
  onLogoClick,
  avatar,
  tabs,
  onChange,
}: Pick<
  PageHeaderProps,
  | "navigation"
  | "logo"
  | "logoAlt"
  | "logoHref"
  | "onLogoClick"
  | "avatar"
  | "tabs"
  | "onChange"
>) {
  const [selected, setSelected] = useState("overview");
  const handleNavigationChange = (value: string) => {
    setSelected(value);
    onChange?.(value);
  };
  const sidebarItems = navigationOptions.map((option) => ({
    label: option.label,
    value: option.value,
    icon: <Icon name={option.icon} />,
    selected: option.value === selected,
    ...(option.value === "projects"
      ? {
          children: [
            {
              label: "Meus projetos",
              selected: selected === "projects",
            },
          ],
        }
      : {}),
  }));
  const menuGroups = [
    {
      label: "Navegação",
      items: navigationOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    },
  ];

  return (
    <>
      <PageHeader
        logo={logo}
        logoAlt={logoAlt}
        logoHref={logoHref}
        onLogoClick={onLogoClick}
        navigation={navigation}
        sidebarItems={sidebarItems}
        menuGroups={menuGroups}
        avatar={avatar}
        tabs={navigation === "tabs" ? tabs : undefined}
        tabsValue={navigation === "tabs" ? selected : undefined}
        onChange={handleNavigationChange}
      />
      <Content selected={selected} />
    </>
  );
}

function Content({ selected }: { selected: string }) {
  const selectedLabel = navigationOptions.find(
    (option) => option.value === selected,
  )?.label;

  return (
    <Box sx={{ bgcolor: "background.paper", p: 3 }}>
      Conteúdo selecionado: {selectedLabel}
    </Box>
  );
}
