/**
 * Configuração declarativa de uma listagem por papel.
 *
 * A página registra as colunas e os filtros disponíveis uma única vez. Cada
 * papel apenas escolhe quais IDs serão utilizados e em qual ordem.
 */
export type RoleListConfig<ColumnId extends string, FilterKey extends string> = {
  title: string;
  description: string;
  emptyStateDescription: string;
  columnIds: readonly ColumnId[];
  filters: readonly FilterKey[];
  columnLabels?: Partial<Record<ColumnId, string>>;
  filterLabels?: Partial<Record<FilterKey, string>>;
};
