export type ResourceStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export type MutationState<TError, TOperation> = {
  operation: TOperation | null;
  status: ResourceStatus;
  error: TError | null;
};

export type ResourceState<TItem, TFilters, TPagination, TError, TOperation> = {
  list: {
    items: TItem[];
    pagination: TPagination | null;
    filters: TFilters;
    page: number;
    pageSize: number;
    status: ResourceStatus;
    error: TError | null;
  };
  mutation: MutationState<TError, TOperation>;
};
