import { Button, Dialog, type ButtonProps } from '@niar/ui';
import type { ReactNode } from 'react';

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
}: ConfirmationDialogProps) {
  const confirmColor: ButtonProps['color'] = type === 'danger' ? 'danger' : 'primary';

  return (
    <Dialog
      open={open}
      title={title}
      aria-label={ariaLabel}
      onClose={onClose}
      actions={(
        <>
          <Button type="button" variant="text" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="contained" color={confirmColor} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      )}
    >
      {children}
    </Dialog>
  );
}
