export type ApiError = {
  message: string;
  status?: number;
};

export type AsyncStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export type OperationState = {
  status: AsyncStatus;
  error: ApiError | null;
  operation: string | null;
};

export const idleOperation = (): OperationState => ({
  status: 'idle',
  error: null,
  operation: null,
});
