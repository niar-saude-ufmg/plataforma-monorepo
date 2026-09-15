import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Listing } from "./Listing";
import { Filter } from "../Filter/Filter";

const columns = [
  { key: "name", label: "Projeto" },
  { key: "status", label: "Status" },
] as const;
const rows = [
  { name: "Projeto A", status: "Em análise" },
  { name: "Projeto B", status: "Aprovado" },
];
const filter = (
  <Filter
    search={[{ key: "project", label: "Projeto", options: ["Projeto A", "Projeto B"] }]}
    checkedOptions={[{
      key: "status",
      label: "Status",
      type: "checkbox",
      options: [
        { value: "analysis", label: "Em análise" },
        { value: "approved", label: "Aprovado" },
      ],
    }]}
  />
);

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
      table: { category: "ACCESSIBILITY", defaultValue: { summary: "1" } },
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
    filter: {
      control: "object",
      description: "Componente React opcional exibido acima da listagem.",
      table: { category: "PROPS" },
    },
    loading: {
      control: "boolean",
      description: "Exibe Skeleton enquanto os dados estão sendo carregados.",
      table: { category: "PROPS", defaultValue: { summary: "filter-dependent" } },
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
    tableBorder: {
      control: "boolean",
      description: "Define se a Table terá contorno próprio dentro do Card.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
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

export const Filtered: Story = {
  args: {
    title: "Projetos",
    columns,
    rows,
    filter,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Listagem com um componente Filter acima da tabela." },
      source: {
        code: `<Listing
  filter={<Filter search={[{ key: "project", label: "Projeto", options: ["Projeto A", "Projeto B"] }]} />}
  columns={columns}
  rows={rows}
/>`,
      },
    },
  },
  render: () => <FilteredListing />,
};

function FilteredListing() {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const filteredRows = rows.filter((row) => {
    const project = values.project;
    const statuses = Array.isArray(values.status) ? values.status : [];
    return (
      (!project || row.name === project) &&
      (statuses.length === 0 || statuses.includes(row.status))
    );
  });

  return (
    <Listing
      title="Projetos"
      columns={columns}
      rows={filteredRows}
      filter={
        <Filter
          search={[
            {
              key: "project",
              label: "Projeto",
              options: ["Projeto A", "Projeto B"],
            },
          ]}
          checkedOptions={[
            {
              key: "status",
              label: "Status",
              type: "checkbox",
              options: [
                { value: "Em análise", label: "Em análise" },
                { value: "Aprovado", label: "Aprovado" },
              ],
            },
          ]}
          values={values}
          onChange={setValues}
        />
      }
    />
  );
}

export const Loading: Story = {
  args: {
    loading: true,
    title: "Projetos",
    description: "Acompanhe os projetos cadastrados na plataforma.",
    columns,
    rows: [],
    action: <Button variant="contained">Cadastrar projeto</Button>,
    filter,
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
