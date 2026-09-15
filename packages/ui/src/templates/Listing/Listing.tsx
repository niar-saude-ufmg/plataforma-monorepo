import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type { TablePaginationProps } from "@mui/material/TablePagination";
import type { TableColumn, TableProps } from "../../components/Table/Table";
import { EmptyState, type EmptyStateProps } from "../../components/EmptyState/EmptyState";
import { Skeleton } from "../../components/Skeleton/Skeleton";
import { Table } from "../../components/Table/Table";
import { Card } from "../../components/Card/Card";
import { niar } from "../../tokens/index";
import { PageIntro } from "../PageIntro/PageIntro";
import {
  listingActionSkeletonStyles,
  listingCardStyles,
  listingContentStyles,
  listingDescriptionSkeletonStyles,
  listingHeaderStyles,
  listingDescriptionStyles,
  listingTitleStyles,
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
  tableBorder?: boolean;
};

export function Listing<T extends Record<string, unknown>>({
  loading = false,
  title,
  "aria-level": ariaLevel = 1,
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
  tableBorder,
}: ListingProps<T>) {
  return (
    <Box sx={listingContentStyles}>
      {(title || description || action) && (
        <Box sx={listingHeaderStyles}>
          <Box>{title && <PageIntro title={title} description={rows.length > 0 ? description : undefined} loading={loading} aria-level={ariaLevel} />}</Box>
          {loading ? (
            <Box sx={listingActionSkeletonStyles}>
              <Skeleton variant="rounded" lines={1} height={40} width="100%" />
            </Box>
          ) : rows.length > 0 ? (
            action
          ) : null}
        </Box>
      )}
      {rows.length === 0 && !loading ? (
        <Box role="status" aria-label="Lista de registros vazia">
          <EmptyState
            title="Nenhum registro encontrado"
            description="Não há dados para exibir no momento."
            aria-level={3}
            {...emptyState}
          />
        </Box>
      ) : (
        <Card variant="outlined" sx={listingCardStyles}>
          <Box sx={{ display: "grid", gap: niar.spacing["2xl"] }}>
            {loading ? filter ? <Skeleton variant="rounded" lines={1} height={48} /> : null : filter}
            {loading ? <Box aria-live="polite"><Skeleton variant="rounded" lines={5} height={48} /></Box> : <Table columns={columns} rows={rows} aria-label={ariaLabel} pagination={pagination} selectable={selectable} onSelectionChange={onSelectionChange} border={tableBorder ?? Boolean(filter)} />}
          </Box>
        </Card>
      )}
    </Box>
  );
}
