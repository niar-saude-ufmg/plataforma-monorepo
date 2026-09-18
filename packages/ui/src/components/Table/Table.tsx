import MuiTable, {
  type TableProps as MuiTableProps,
} from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination, {
  type TablePaginationProps,
} from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Fragment } from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import { niar } from "../../tokens/index";

export type TableColumn<T> = {
  key: keyof T & string;
  label: ReactNode;
  align?: "left" | "center" | "right" | "justify" | "inherit";
  sortable?: boolean;
  sortDirection?: "asc" | "desc";
  onClick?: () => void;
  render?: (value: T[keyof T], row: T) => ReactNode;
};

export type TableProps<T extends Record<string, unknown>> = Omit<
  MuiTableProps,
  "children" | "padding" | "stickyHeader" | "border"
> & {
  columns: readonly TableColumn<T>[];
  rows: readonly T[];
  collapsible?: (row: T) => ReactNode;
  expandedRows?: readonly T[];
  onExpandChange?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: readonly T[];
  selectAllChecked?: boolean;
  selectAllIndeterminate?: boolean;
  onSelectionChange?: (row: T, selected: boolean) => void;
  onSelectAllChange?: (selected: boolean) => void;
  pagination?: Omit<TablePaginationProps, "component">;
  border?: boolean;
  labels?: Partial<{ actions: string; selectAll: string; selectRow: string; expand: string; empty: string }>;
};

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  collapsible,
  expandedRows = [],
  onExpandChange,
  selectable = false,
  selectedRows = [],
  selectAllChecked = false,
  selectAllIndeterminate = false,
  onSelectionChange,
  onSelectAllChange,
  pagination,
  border = true,
  labels,
  ...tableProps
}: TableProps<T>) {
  const tableLabels = { actions: "Ações", selectAll: "Selecionar todas as linhas", selectRow: "Selecionar linha", expand: "Expandir linha", empty: "Nenhum registro encontrado", ...labels };
  // Table is presentational: the parent prepares the rows for the current
  // view and owns sorting, pagination, selection and expansion state.
  const visibleRows = rows;
  return (
    <TableContainer component={Paper} elevation={0} variant={border ? "outlined" : undefined} sx={{ maxWidth: "100%", overflowX: "auto" }}>
      <MuiTable
        {...tableProps}
        sx={{
          "& .MuiTableBody-root tr:last-child td": { borderBottom: 0 },
          ...tableProps.sx,
        }}
      >
        <TableHead sx={{ "& .MuiTableCell-head": { fontWeight: niar.fontWeight.semibold } }}>
          <TableRow>
            {collapsible ? <TableCell>{tableLabels.actions}</TableCell> : null}
            {selectable ? (
              <TableCell>
                <Checkbox
                  checked={selectAllChecked}
                  indeterminate={selectAllIndeterminate}
                  onChange={(event) => onSelectAllChange?.(event.target.checked)}
                  slotProps={{
                    input: { "aria-label": tableLabels.selectAll },
                  }}
                />
              </TableCell>
            ) : null}
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align}>
                {column.sortable ? (
                  <TableSortLabel
                    active={column.sortable}
                    direction={column.sortDirection ?? "asc"}
                    sx={{
                      color: "text.primary",
                      "& .MuiTableSortLabel-icon": {
                        opacity: 1,
                        color: "inherit",
                      },
                    }}
                    onClick={column.onClick}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length + (collapsible ? 1 : 0) + (selectable ? 1 : 0)
                }
              >
                <Typography color="text.secondary" align="center">
                  {tableLabels.empty}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            visibleRows.map((row, rowIndex) => (
              <Fragment key={rowIndex}>
                <TableRow hover>
                  {collapsible ? (
                    <TableCell>
                      <IconButton
                        size="small"
                        aria-label={tableLabels.expand}
                        onClick={() => onExpandChange?.(row)}
                      >
                        {expandedRows.includes(row) ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )}
                      </IconButton>
                    </TableCell>
                  ) : null}
                  {selectable ? (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(row)}
                        onChange={(event) => onSelectionChange?.(row, event.target.checked)}
                        slotProps={{
                          input: { "aria-label": tableLabels.selectRow },
                        }}
                      />
                    </TableCell>
                  ) : null}
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
                {collapsible ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (selectable ? 1 : 0) + 1} sx={{ py: 0 }}>
                      <Collapse in={expandedRows.includes(row)}>
                        <Box sx={{ py: 2 }}>{collapsible(row)}</Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))
          )}
        </TableBody>
      </MuiTable>
      {pagination ? <TablePagination component="div" {...pagination} /> : null}
    </TableContainer>
  );
}
