export type AsyncStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export type ListState<Item, Filters, PaginationType, ErrorType> = {
  items: Item[];
  pagination: PaginationType | null;
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

export type FileState<ErrorType> = {
  status: AsyncStatus;
  error: ErrorType | null;
  filename: string | null;
};

export type ResourceState<Item, Filters, PaginationType, ErrorType, Operation extends string = string> = {
  list: ListState<Item, Filters, PaginationType, ErrorType>;
  selected?: Item | null;
  mutation?: MutationState<ErrorType, Operation>;
};
