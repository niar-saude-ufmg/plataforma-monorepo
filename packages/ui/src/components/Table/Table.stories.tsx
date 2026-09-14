import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  useMemo,
  useState,
} from "react";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import Chip from "@mui/material/Chip";
import { StatusChip } from "../StatusChip/StatusChip";
import TableSortLabel from "@mui/material/TableSortLabel";
import { Table } from "./Table";

const meta = {
  title: "Componentes/Table",
  component: Table,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium"] },
  },
  parameters: {
    docs: {
      codePanel: true,
      description: {
        component: "Tabela baseada no Table do MUI para listar projetos, status e demais dados da plataforma.",
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { name: "Estudo de saúde pública", status: "Em análise", updated: "Hoje" },
  { name: "Dados epidemiológicos", status: "Aprovado", updated: "Ontem" },
  { name: "Pesquisa longitudinal", status: "Em análise", updated: "03/09/2026" },
];

const plainColumns = [
  { key: "name", label: "Projeto" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Atualizado", align: "right" as const },
] as const;

const chipColumns = [
  plainColumns[0],
  {
    key: "status",
    label: "Status",
    render: (value: unknown) => {
      const status = String(value);
      return (
        <Chip
          label={status}
          color={status === "Aprovado" ? "success" : "warning"}
          size="small"
        />
      );
    },
  },
  plainColumns[2],
] as const;

export const Playground: Story = {
  args: { columns: chipColumns, rows, "aria-label": "Projetos" },
};

export const Status: Story = {
  args: {
    columns: chipColumns,
    rows,
    "aria-label": "Projetos com status",
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Exemplo de coluna de status usando o componente StatusChip.",
      },
    },
  },
};

export const Small: Story = {
  args: {
    columns: [
      plainColumns[0],
      {
        key: "status",
        label: "Status",
        render: (value: unknown) => (
          <StatusChip
            status={String(value) === "Aprovado" ? "success" : "warning"}
            display="text"
            label={String(value)}
          />
        ),
      },
      plainColumns[2],
    ],
    rows,
    size: "small",
    "aria-label": "Projetos compactos",
  },
  parameters: { docs: { description: { story: "Versão compacta para listagens com maior quantidade de registros." } } },
};

export const Sizes: Story = {
  args: { columns: plainColumns, rows },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Table columns={plainColumns} rows={rows} size="small" />
      <Table columns={plainColumns} rows={rows} size="medium" />
    </div>
  ),
  parameters: { controls: { disable: true }, docs: { description: { story: "Comparação entre os tamanhos Small e Medium." } } },
};

export const Actions: Story = {
  args: {
    columns: [
      ...plainColumns,
      {
        key: "actions",
        label: "Ações",
        render: () => (
          <div style={{ display: "flex", gap: 8 }}>
            <IconButton size="small" aria-label="Mais ações"><MoreVert /></IconButton>
            <Button size="small" variant="text">Abrir</Button>
            <Button size="small" variant="outlined">Editar</Button>
            <Button size="small" variant="contained">Enviar</Button>
          </div>
        ),
      },
    ],
    rows: rows.map((row) => ({ ...row, actions: true })),
  },
  parameters: { controls: { disable: true }, docs: { description: { story: "Ações de linha podem usar botão com ícone, texto ou a versão small conforme a tarefa." } } },
};

function SortingExample() {
  const [ascending, setAscending] = useState(true);
  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)),
    [ascending],
  );

  return (
    <Table
      columns={[
        {
          key: "name",
          label: (
            <TableSortLabel
              active
              direction={ascending ? "asc" : "desc"}
              onClick={() => setAscending((value) => !value)}
            >
              Projeto
            </TableSortLabel>
          ),
        },
        plainColumns[1],
        plainColumns[2],
      ]}
      rows={sortedRows}
    />
  );
}

export const Sorting: Story = { args: { columns: plainColumns, rows }, render: () => <SortingExample /> };

function SelectingExample() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = selected.size === rows.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.name)));

  return (
    <Table
      columns={[
        {
          key: "name",
          label: <Checkbox checked={allSelected} onChange={toggleAll} slotProps={{ input: { "aria-label": "Selecionar todos" } }} />,
          render: (value: unknown) => {
            const name = String(value);
            return <><Checkbox checked={selected.has(name)} onChange={() => setSelected((current) => { const next = new Set(current); next.has(name) ? next.delete(name) : next.add(name); return next; })} slotProps={{ input: { "aria-label": `Selecionar ${name}` } }} />{name}</>;
          },
        },
        plainColumns[1],
        plainColumns[2],
      ]}
      rows={rows}
    />
  );
}

export const Selecting: Story = { args: { columns: plainColumns, rows }, render: () => <SelectingExample /> };

function PaginationExample() {
  return (
    <Table
      columns={plainColumns}
      rows={Array.from({ length: 24 }, (_, index) => ({ ...rows[index % rows.length], name: `${rows[index % rows.length].name} ${index + 1}` }))}
      pagination={{ rowsPerPageOptions: [3, 6, 12], labelRowsPerPage: "Linhas por página" }}
    />
  );
}

export const Pagination: Story = { args: { columns: plainColumns, rows }, render: () => <PaginationExample /> };

export const Collapsible: Story = {
  args: {
    columns: plainColumns,
    rows,
    collapsible: (row) => (
      <Table
        size="small"
        columns={[
          { key: "field", label: "Campo" },
          { key: "value", label: "Valor" },
        ]}
        rows={[
          { field: "Projeto", value: row.name },
          { field: "Responsável", value: "Usuário NIAR" },
          { field: "Última atualização", value: row.updated },
        ]}
        aria-label={`Detalhes de ${row.name}`}
        containerProps={{ sx: { borderLeft: 0, borderRight: 0, borderRadius: 0 } }}
      />
    ),
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "A propriedade collapsible usa Collapse do MUI e pode renderizar uma segunda Table com os detalhes relacionados.",
      },
    },
  },
};
