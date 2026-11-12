import { Button, Dialog, type ButtonProps } from '@niar/ui';
import type { ReactNode } from 'react';

export type FixedDialogProps = {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
  actions: ReactNode;
  ariaLabel?: string;
  minWidth?: string;
};

export function FixedDialog({
  open,
  title,
  children,
  onClose,
  actions,
  ariaLabel = 'Ação obrigatória',
  minWidth = "360",
}: FixedDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      aria-label={ariaLabel}
      onClose={onClose}
      showCloseButton={false}
      minWidth={minWidth}
      closeOnBackdropClick={false}
      disableEscapeKeyDown={true}
      actions={actions}
    >
      {children}
    </Dialog>
  );
}
