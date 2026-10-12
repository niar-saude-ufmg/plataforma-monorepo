import type { Meta, StoryObj } from "@storybook/react-vite";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { Input, Select, Textarea } from "../../components";
import { Form } from "../Form/Form";
import { Filter } from "../Filter/Filter";
import { Listing } from "../Listing/Listing";
import { PageIntro } from "../PageIntro/PageIntro";
import { PageContainer } from "./PageContainer";

const meta = {
  title: "Templates/PageContainer",
  component: PageContainer,
  parameters: { layout: "fullscreen", docs: { codePanel: true } },
  argTypes: {
    children: {
      control: false,
      description: "Conteúdo da rota renderizado na área principal.",
      table: { category: "CONTENT" },
    },
    tabs: {
      control: "object",
      description: "Abas exibidas no cabeçalho, com value e label.",
      table: { category: "NAVIGATION" },
    },
    navigation: {
      control: "select",
      options: ["tabs", "menu", "sidebar"],
      description: "Modo de navegação exibido pelo PageHeader.",
      table: { category: "NAVIGATION", defaultValue: { summary: "tabs" } },
    },
    sidebarItems: {
      control: "object",
      description: "Itens e subitens usados quando navigation é sidebar.",
      table: { category: "NAVIGATION" },
    },
    menuGroups: {
      control: "object",
      description: "Grupos e itens usados quando navigation é menu.",
      table: { category: "NAVIGATION" },
    },
    activeItem: {
      control: "text",
      description: "Item ativo para tabs, menu ou sidebar, normalmente derivado da rota atual.",
      table: { category: "NAVIGATION" },
    },
    showAvatar: {
      control: "boolean",
      description: "Controla a exibição do avatar no cabeçalho.",
      table: { category: "HEADER", defaultValue: { summary: "true" } },
    },
    actions: {
      control: false,
      description: "Conteúdo adicional exibido no final do cabeçalho, como ações da página.",
      table: { category: "HEADER" },
    },
    onItemChange: {
      action: "item changed",
      description: "Chamado quando o usuário seleciona uma tab, item de menu ou item de sidebar.",
      table: { category: "EVENTS" },
    },
  },
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <PageContainer {...args}>
      {({ activeTab }) => {
        if (activeTab === "register") {
          return (
            <Form title="Cadastro" description="Preencha os dados para cadastrar um novo projeto.">
              <Stack spacing={2}>
                <Input label="Nome do projeto" required />
                <Textarea label="Descrição do projeto" />
                <Select label="Tipo de projeto" options={[{ value: "own", label: "Base própria" }, { value: "niar", label: "Base NIAR" }]} />
                <Input label="Responsável" />
                <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", width: "100%" }}>
                  <Button variant="outlined">Cancelar</Button>
                  <Button variant="contained">Cadastrar projeto</Button>
                </Stack>
              </Stack>
            </Form>
          );
        }
        if (activeTab === "projects") {
          return (
            <Listing
              title="Projetos"
              description="Acompanhe os projetos cadastrados e seus respectivos status."
              columns={[{ key: "name", label: "Projeto" }, { key: "status", label: "Status" }]}
              rows={[{ name: "Projeto NIAR", status: "Em análise" }, { name: "Estudo SUS", status: "Aprovado" }]}
              filter={<Filter search={[{ key: "project", label: "Projeto", options: ["Projeto NIAR", "Estudo SUS"] }]} />}
              tableBorder
            />
          );
        }
        return <><PageIntro title="Início" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante, sed dignissim justo suscipit." /><Typography>Conteúdo institucional da plataforma.</Typography></>;
      }}
    </PageContainer>
  ),
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Shell de página que mantém o PageHeader e reserva a área principal para o conteúdo da rota." },
      source: { code: '<PageContainer><ProjectContent /></PageContainer>' },
    },
  },
};
