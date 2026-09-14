import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { TablePaginationProps } from "@mui/material/TablePagination";
import type { TableColumn, TableProps } from "../../components/Table/Table";
import { EmptyState, type EmptyStateProps } from "../../components/EmptyState/EmptyState";
import { Skeleton } from "../../components/Skeleton/Skeleton";
import { Table } from "../../components/Table/Table";
import {
  listingActionSkeletonStyles,
  listingContentStyles,
  listingDescriptionSkeletonStyles,
  listingHeaderStyles,
} from "./Listing.styles";

export type ListingProps<T extends Record<string, unknown>> = {
  loading?: boolean;
  title?: ReactNode;
  "aria-level"?: number;
  description?: ReactNode;
  action?: ReactNode;
  filter?: ReactNode;
  "aria-label"?: string;
  columns: readonly TableColumn<T>[];
  rows?: readonly T[];
  pagination?: Omit<TablePaginationProps, "component">;
  emptyState?: Partial<EmptyStateProps>;
  selectable?: TableProps<T>["selectable"];
  onSelectionChange?: TableProps<T>["onSelectionChange"];
};

export function Listing<T extends Record<string, unknown>>({
  loading = false,
  title,
  "aria-level": ariaLevel = 2,
  description,
  action,
  filter,
  "aria-label": ariaLabel = "Lista de registros",
  columns,
  rows = [],
  pagination,
  emptyState,
  selectable,
  onSelectionChange,
}: ListingProps<T>) {
  return (
    <Box sx={listingContentStyles}>
      {(title || description || action) && (
        <Box sx={listingHeaderStyles}>
          <Box>
            {title && (
              <Typography
                component="div"
                role="heading"
                aria-level={ariaLevel}
                variant="h2"
              >
                {title}
              </Typography>
            )}
            {description && loading ? (
              <Box sx={listingDescriptionSkeletonStyles}>
                <Skeleton variant="text" lines={1} height={20} width="100%" />
              </Box>
            ) : description && rows.length > 0 ? (
              <Typography color="text.secondary">{description}</Typography>
            ) : null}
          </Box>
          {loading ? (
            <Box sx={listingActionSkeletonStyles}>
              <Skeleton variant="rounded" lines={1} height={40} width="100%" />
            </Box>
          ) : rows.length > 0 ? (
            action
          ) : null}
        </Box>
      )}
      {loading ? (
        filter ? <Skeleton variant="rounded" lines={1} height={48} /> : null
      ) : (
        filter
      )}
      {loading ? (
        <Box aria-live="polite">
          <Skeleton variant="rounded" lines={5} height={48} />
        </Box>
      ) : rows.length === 0 ? (
        <Box role="status" aria-label="Lista de registros vazia">
          <EmptyState
            title="Nenhum registro encontrado"
            description="Não há dados para exibir no momento."
            aria-level={3}
            {...emptyState}
          />
        </Box>
      ) : (
        <Table
          columns={columns}
          rows={rows}
          aria-label={ariaLabel}
          pagination={pagination}
          selectable={selectable}
          onSelectionChange={onSelectionChange}
        />
      )}
    </Box>
  );
}
