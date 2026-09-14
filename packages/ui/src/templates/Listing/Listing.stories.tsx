import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@mui/material/Button";
import { Listing } from "./Listing";

const columns = [
  { key: "name", label: "Projeto" },
  { key: "status", label: "Status" },
] as const;
const rows = [
  { name: "Projeto A", status: "Em análise" },
  { name: "Projeto B", status: "Aprovado" },
];

const meta = {
  title: "Templates/Listing",
  component: Listing,
  parameters: { layout: "padded", docs: { codePanel: true } },
  argTypes: {
    title: {
      control: "text",
      description: "Título opcional exibido acima da listagem.",
      table: { category: "PROPS" },
    },
    "aria-level": {
      control: "number",
      description: "Nível semântico do título da listagem.",
      table: { category: "ACCESSIBILITY", defaultValue: { summary: "2" } },
    },
    description: {
      control: "text",
      description: "Texto auxiliar exibido abaixo do título.",
      table: { category: "PROPS" },
    },
    action: {
      control: false,
      description: "Ação opcional exibida ao lado do título, como cadastrar.",
      table: { category: "PROPS" },
    },
    loading: {
      control: "boolean",
      description: "Exibe Skeleton enquanto os dados estão sendo carregados.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    "aria-label": {
      control: "text",
      description: "Nome acessível da tabela de registros.",
      table: {
        category: "ACCESSIBILITY",
        defaultValue: { summary: "Lista de registros" },
      },
    },
    columns: {
      control: "object",
      description: "Definição das colunas encaminhada para Table.",
      table: { category: "PROPS" },
    },
    rows: {
      control: "object",
      description: "Registros exibidos na tabela.",
      table: { category: "PROPS" },
    },
    pagination: {
      control: "object",
      description: "Props do TablePagination do MUI, como count, page, rowsPerPage e seus eventos.",
      table: { category: "PROPS" },
    },
    selectable: {
      control: "boolean",
      description: "Exibe seleção por linha e seleção de todas as linhas.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    onSelectionChange: {
      action: "selection changed",
      description: "Evento disparado com as linhas selecionadas.",
      table: { category: "EVENTS" },
    },
    emptyState: {
      control: "object",
      description: "Personalização do EmptyState exibido sem registros.",
      table: { category: "PROPS" },
    },
  },
} satisfies Meta<typeof Listing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    loading: false,
    title: "Projetos",
    description: "Acompanhe os projetos cadastrados na plataforma.",
    columns,
    rows,
  },
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Configure o estado e os dados da listagem." },
      source: { code: '<Listing columns={columns} rows={rows} />' },
    },
  },
};

export const Action: Story = {
  args: {
    title: "Projetos",
    description: "Acompanhe os projetos cadastrados na plataforma.",
    columns,
    rows,
    action: <Button variant="contained">Cadastrar projeto</Button>,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Listagem com uma ação no cabeçalho." },
      source: {
        code: `<Listing
  title="Projetos"
  description="Acompanhe os projetos cadastrados na plataforma."
  action={<Button variant="contained">Cadastrar projeto</Button>}
  columns={columns}
  rows={rows}
/>`,
      },
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    title: "Projetos",
    description: "Acompanhe os projetos cadastrados na plataforma.",
    columns,
    rows: [],
    action: <Button variant="contained">Cadastrar projeto</Button>,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Estado exibido enquanto os dados são carregados." },
      source: { code: '<Listing loading columns={columns} />' },
    },
  },
};

export const Empty: Story = {
  args: {
    title: "Projetos",
    columns,
    rows: [],
    action: <Button variant="contained">Cadastrar projeto</Button>,
    emptyState: {
      title: "Nenhum projeto cadastrado",
      description: "Cadastre o primeiro projeto para começar.",
      action: <Button variant="outlined">Cadastrar projeto</Button>,
    },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Estado exibido quando a busca não retorna registros." },
      source: { code: '<Listing columns={columns} rows={[]} />' },
    },
  },
};
