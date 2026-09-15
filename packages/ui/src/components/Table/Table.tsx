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
import { Fragment, useState } from "react";
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
  selectable?: boolean;
  onSelectionChange?: (rows: readonly T[]) => void;
  pagination?: Omit<TablePaginationProps, "component">;
  border?: boolean;
  labels?: Partial<{ actions: string; selectAll: string; selectRow: string; expand: string; empty: string }>;
};

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  collapsible,
  selectable = false,
  onSelectionChange,
  pagination,
  border = true,
  labels,
  ...tableProps
}: TableProps<T>) {
  const tableLabels = { actions: "Ações", selectAll: "Selecionar todas as linhas", selectRow: "Selecionar linha", expand: "Expandir linha", empty: "Nenhum registro encontrado", ...labels };
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sort, setSort] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const sortedRows = sort
    ? [...rows].sort((a, b) => {
        const aValue = String(a[sort.key] ?? "");
        const bValue = String(b[sort.key] ?? "");
        const result = aValue.localeCompare(bValue);
        return sort.direction === "asc" ? result : -result;
      })
    : rows;
  const visibleRows = pagination
    ? sortedRows.slice(
        pagination.page * pagination.rowsPerPage,
        pagination.page * pagination.rowsPerPage + pagination.rowsPerPage,
      )
    : sortedRows;
  const allSelected =
    selected.size === sortedRows.length && sortedRows.length > 0;
  const toggleSelection = (index: number) => {
    setSelected((current) => {
      const next = new Set(current);
      next.has(index) ? next.delete(index) : next.add(index);
      onSelectionChange?.(
        sortedRows.filter((_, rowIndex) => next.has(rowIndex)),
      );
      return next;
    });
  };
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
                  checked={allSelected}
                  indeterminate={selected.size > 0 && !allSelected}
                  onChange={() => {
                    const next = allSelected
                      ? new Set<number>()
                      : new Set(sortedRows.map((_, index) => index));
                    setSelected(next);
                    onSelectionChange?.(allSelected ? [] : sortedRows);
                  }}
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
                    active={sort?.key === column.key || column.sortable}
                    direction={
                      sort?.key === column.key ? sort.direction : "asc"
                    }
                    sx={{
                      color: "text.primary",
                      "& .MuiTableSortLabel-icon": {
                        opacity: 1,
                        color: "inherit",
                      },
                    }}
                    onClick={() => {
                      const direction =
                        sort?.key === column.key && sort.direction === "asc"
                          ? "desc"
                          : "asc";
                      setSort({ key: column.key, direction });
                      column.onClick?.();
                    }}
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
            visibleRows.map((row, index) => (
              <Fragment key={index}>
                <TableRow hover key={index}>
                  {collapsible ? (
                    <TableCell>
                      <IconButton
                        size="small"
                        aria-label={tableLabels.expand}
                        onClick={() =>
                          setExpanded(expanded === index ? null : index)
                        }
                      >
                        {expanded === index ? (
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
                        checked={selected.has(index)}
                        onChange={() => toggleSelection(index)}
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
                    <TableCell colSpan={columns.length + 1} sx={{ py: 0 }}>
                      <Collapse in={expanded === index}>
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
