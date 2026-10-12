export type ApiErrorPayload = {
  message: string;
  fieldErrors?: Record<string, string>;
};

export function getApiErrorPayload(error: unknown): ApiErrorPayload | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  if ('data' in error && typeof error.data === 'object' && error.data !== null) {
    return getApiErrorPayload(error.data);
  }

  if ('message' in error && typeof error.message === 'string') {
    return error as ApiErrorPayload;
  }

  return undefined;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  return getApiErrorPayload(error)?.message ?? fallbackMessage;
}
