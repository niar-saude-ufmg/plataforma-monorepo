import { Button, Dialog, type ButtonProps } from '@niar/ui';
import type { ReactNode } from 'react';
import './ConfirmationDialog.scss';

export type ConfirmationDialogProps = {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  cancelLabel?: string;
  type?: 'default' | 'danger';
  ariaLabel?: string;
  loading?: boolean;
};

export function ConfirmationDialog({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel,
  cancelLabel = 'Cancelar',
  type = 'default',
  ariaLabel = 'Confirmar ação',
  loading = false,
}: ConfirmationDialogProps) {
  const confirmColor: ButtonProps['color'] = type === 'danger' ? 'danger' : 'primary';

  return (
    <Dialog
      open={open}
      title={title}
      aria-label={ariaLabel}
      onClose={loading ? undefined : onClose}
      actions={(
        <>
          <Button type="button" variant="text" disabled={loading} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="contained" color={confirmColor} disabled={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      )}
    >
      <div className="confirmation-dialog-description">{children}</div>
    </Dialog>
  );
}
