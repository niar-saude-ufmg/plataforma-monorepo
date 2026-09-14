import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import Chip from "@mui/material/Chip";
import { StatusChip } from "../StatusChip/StatusChip";
import { Table } from "./Table";

const meta = {
  title: "Componentes/Table",
  component: Table,
  argTypes: {
    columns: {
      description:
        "Define as colunas exibidas, com chave, label, alinhamento e render opcional para conteúdos como Chip ou ações.",
      table: { category: "PROPS", type: { summary: "readonly TableColumn[]" } },
    },
    rows: {
      description:
        "Lista de registros que será renderizada no corpo da tabela.",
      table: { category: "PROPS", type: { summary: "readonly T[]" } },
    },
    size: {
      control: "select",
      options: ["small", "medium"],
      description: "Controla a densidade vertical das células.",
      table: { category: "PROPS", defaultValue: { summary: "medium" } },
    },
    "aria-label": {
      description: "Nome acessível da tabela para leitores de tela.",
      control: "text",
      table: { category: "ACCESSIBILITY", type: { summary: "string" } },
    },
    pagination: {
      description:
        "Configura a paginação oficial do MUI. Quando informada, a Table recorta os registros e renderiza TablePagination no rodapé.",
      table: { category: "PROPS", type: { summary: "TablePaginationProps" } },
    },
    collapsible: {
      description:
        "Função que retorna o conteúdo exibido ao expandir uma linha, inclusive uma segunda Table para detalhes relacionados.",
      table: { category: "PROPS", type: { summary: "(row: T) => ReactNode" } },
    },
  },
  parameters: {
    docs: {
      codePanel: true,
      description: {
        component:
          "Tabela baseada no Table do MUI para listar projetos, status, ações e detalhes relacionados da plataforma. A API mantém a composição de colunas e linhas do MUI e adiciona exemplos prontos para os padrões mais usados no NIAR.",
      },
      source: { code: "<Table columns={columns} rows={rows} />" },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { name: "Estudo de saúde pública", status: "Em análise", updated: "Hoje" },
  { name: "Dados epidemiológicos", status: "Aprovado", updated: "Ontem" },
  {
    name: "Pesquisa longitudinal",
    status: "Em análise",
    updated: "03/09/2026",
  },
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
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo principal para explorar as propriedades da tabela e visualizar uma coluna de status com Chip.",
      },
    },
  },
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
      source: {
        code: 'const rows = [{ name: \"Projeto A\", status: \"Aprovado\" }];\nconst columns = [{ key: \"name\", label: \"Projeto\" }, { key: \"status\", label: \"Status\", render: (value) => <StatusChip status=\"success\" label={String(value)} /> }];\n\n<Table columns={columns} rows={rows} />',
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
  parameters: {
    docs: {
      description: {
        story:
          "Versão compacta para listagens com maior quantidade de registros.",
      },
      source: {
        code: '<Table columns={columnsWithTextStatus} rows={rows} size="small" />',
      },
    },
  },
};

export const Sizes: Story = {
  args: { columns: plainColumns, rows },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Table columns={plainColumns} rows={rows} size="small" />
      <Table columns={plainColumns} rows={rows} size="medium" />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Comparação entre os tamanhos Small e Medium." },
    },
  },
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
            <IconButton size="small" aria-label="Mais ações">
              <MoreVert />
            </IconButton>
            <Button size="small" variant="text">
              Abrir
            </Button>
            <Button size="small" variant="outlined">
              Editar
            </Button>
            <Button size="small" variant="contained">
              Enviar
            </Button>
          </div>
        ),
      },
    ],
    rows: rows.map((row) => ({ ...row, actions: true })),
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Ações de linha podem usar botão com ícone, texto ou a versão small conforme a tarefa.",
      },
      source: {
        code: 'const columns = [{ key: \"name\", label: \"Projeto\" }, { key: \"actions\", label: \"Ações\", render: (_, row) => <Button size=\"small\" onClick={() => abrirProjeto(row)}>Abrir</Button> }];\nconst rows = [{ name: \"Projeto A\", actions: null }];\n\n<Table columns={columns} rows={rows} />',
      },
    },
  },
};

function SortingExample() {
  return (
    <Table
      columns={[
        {
          ...plainColumns[0],
          sortable: true,
          onClick: () => console.log("Ordenação alterada"),
        },
        plainColumns[1],
        plainColumns[2],
      ]}
      rows={rows}
    />
  );
}

export const Sorting: Story = {
  args: { columns: plainColumns, rows },
  render: () => <SortingExample />,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Use sortable na coluna para exibir a seta e alternar a ordem dos registros.",
      },
      source: {
        code: '<Table columns={[{ key: "name", label: "Projeto", sortable: true, onClick: handleSort }]} rows={rows} />',
      },
    },
  },
};

function SelectingExample() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = selected.size === rows.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.name)));

  return (
    <Table
      columns={[
        {
          key: "name",
          label: (
            <Checkbox
              checked={allSelected}
              onChange={toggleAll}
              slotProps={{ input: { "aria-label": "Selecionar todos" } }}
            />
          ),
          render: (value: unknown) => {
            const name = String(value);
            return (
              <>
                <Checkbox
                  checked={selected.has(name)}
                  onChange={() =>
                    setSelected((current) => {
                      const next = new Set(current);
                      next.has(name) ? next.delete(name) : next.add(name);
                      return next;
                    })
                  }
                  slotProps={{ input: { "aria-label": `Selecionar ${name}` } }}
                />
                {name}
              </>
            );
          },
        },
        plainColumns[1],
        plainColumns[2],
      ]}
      rows={rows}
    />
  );
}

export const Selecting: Story = {
  args: { columns: plainColumns, rows, selectable: true },
  render: (args) => (
    <Table
      {...args}
      onSelectionChange={(selectedRows) =>
        console.log("Linhas selecionadas", selectedRows)
      }
    />
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A propriedade selectable adiciona seleção individual e seleção de todas as linhas com Checkbox do MUI.",
      },
      source: {
        code: 'const rows = [{ name: "Projeto A", status: "Aprovado" }];\nconst columns = [{ key: "name", label: "Projeto" }, { key: "status", label: "Status" }];\n\n<Table\n  columns={columns}\n  rows={rows}\n  selectable\n  onSelectionChange={(selectedRows) => setSelectedRows(selectedRows)}\n/>',
      },
    },
  },
};

function PaginationExample() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const allRows = Array.from({ length: 24 }, (_, index) => ({
    ...rows[index % rows.length],
    name: `${rows[index % rows.length].name} ${index + 1}`,
  }));
  return (
    <Table
      columns={plainColumns}
      rows={allRows}
      pagination={{
        count: allRows.length,
        page,
        rowsPerPage,
        rowsPerPageOptions: [3, 6, 12],
        labelRowsPerPage: "Linhas por página",
        onPageChange: (_, nextPage) => setPage(nextPage),
        onRowsPerPageChange: (event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        },
      }}
    />
  );
}

export const Pagination: Story = {
  args: { columns: plainColumns, rows },
  render: () => <PaginationExample />,
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A Table integra TablePagination controlado; a aplicação informa page, rowsPerPage e atualiza esses valores nos callbacks.",
      },
      source: {
        code: "const [page, setPage] = useState(0);\nconst [rowsPerPage, setRowsPerPage] = useState(10);\n\n<Table\n  columns={columns}\n  rows={rows}\n  pagination={{\n    count: total,\n    page,\n    rowsPerPage,\n    onPageChange: (_, nextPage) => setPage(nextPage),\n    onRowsPerPageChange: (event) => setRowsPerPage(Number(event.target.value)),\n  }}\n/>",
      },
    },
  },
};

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
      />
    ),
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A propriedade collapsible usa Collapse do MUI e pode renderizar uma segunda Table com os detalhes relacionados.",
      },
      source: {
        code: "<Table columns={columns} rows={rows} collapsible={(row) => <Table columns={detailColumns} rows={getDetails(row)} />} />",
      },
    },
  },
};
