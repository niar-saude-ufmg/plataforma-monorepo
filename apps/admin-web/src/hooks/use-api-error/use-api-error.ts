import type { SnackbarProps } from '@niar/ui';
import { getApiErrorMessage } from '../../utils/api-error';

export type ApiErrorSnackbarProps = Omit<SnackbarProps, 'ref'>;

export function useApiError(
  error: unknown,
  onClose: () => void,
  fallbackMessage: string,
): ApiErrorSnackbarProps {
  return {
    open: Boolean(error),
    message: error ? getApiErrorMessage(error, fallbackMessage) : '',
    severity: 'error',
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
    onClose: () => onClose(),
  };
}
