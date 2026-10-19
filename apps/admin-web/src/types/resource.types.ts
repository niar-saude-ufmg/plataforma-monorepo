export type AsyncStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export type ListState<Item, Filters, Pagination, ErrorType> = {
  items: Item[];
  pagination: Pagination | null;
  filters: Filters;
  page: number;
  pageSize: number;
  status: AsyncStatus;
  error: ErrorType | null;
};

export type MutationState<ErrorType, Operation extends string = string> = {
  operation: Operation | null;
  status: AsyncStatus;
  error: ErrorType | null;
};

export type ResourceState<Item, Filters, Pagination, ErrorType, Operation extends string = string> = {
  list: ListState<Item, Filters, Pagination, ErrorType>;
  selected?: Item | null;
  mutation?: MutationState<ErrorType, Operation>;
};
