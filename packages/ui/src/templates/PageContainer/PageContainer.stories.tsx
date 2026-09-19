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
    children: { control: false, description: "Conteúdo da rota renderizado na área principal.", table: { category: "PROPS" } },
    tabs: { control: "object", description: "Abas exibidas no cabeçalho institucional, com value e label.", table: { category: "PROPS" } },
  },
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <PageContainer>
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
