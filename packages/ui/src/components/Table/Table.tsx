import MuiTable, {
  type TableProps as MuiTableProps,
} from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import type { TableContainerProps } from "@mui/material/TableContainer";
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

export type TableColumn<T> = {
  key: keyof T & string;
  label: ReactNode;
  align?: "left" | "center" | "right" | "justify" | "inherit";
  render?: (value: T[keyof T], row: T) => ReactNode;
};

export type TableProps<T extends Record<string, unknown>> = Omit<
  MuiTableProps,
  "children" | "padding" | "stickyHeader"
> & {
  columns: readonly TableColumn<T>[];
  rows: readonly T[];
  containerProps?: Omit<TableContainerProps, "children">;
  collapsible?: (row: T) => ReactNode;
  pagination?: Omit<
    TablePaginationProps,
    "component" | "count" | "page" | "rowsPerPage" | "onPageChange" | "onRowsPerPageChange"
  >;
};

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  containerProps,
  collapsible,
  pagination,
  ...tableProps
}: TableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expanded, setExpanded] = useState<number | null>(null);
  const visibleRows = pagination
    ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : rows;
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      variant="outlined"
      {...containerProps}
    >
      <MuiTable {...tableProps}>
        <TableHead>
          <TableRow>
            {collapsible ? <TableCell>Ações</TableCell> : null}
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (collapsible ? 1 : 0)}>
                <Typography color="text.secondary" align="center">
                  Nenhum registro encontrado
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
                      aria-label="Expandir linha"
                      onClick={() => setExpanded(expanded === index ? null : index)}
                    >
                      {expanded === index ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
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
      {pagination ? (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          {...pagination}
        />
      ) : null}
    </TableContainer>
  );
}
