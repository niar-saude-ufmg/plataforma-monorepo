import { useEffect, useState } from 'react';
import { Button, RadioGroup, Textarea } from '@niar/ui';
import { ConfirmationDialog } from '../../ConfirmationDialog/ConfirmationDialog';
import type { UserListItem } from '../../../types/user.types';
import { ApiError } from '../../..//types/api.types';


type UserStatusDialogProps = {
  open: boolean;
  user: UserListItem | null;
  action: "activate" | "deactivate";
  loading?: boolean;
  error?: ApiError | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function UserStatusDialog({
  open,
  user,
  action,
  loading = false,
  error = null,
  onClose,
  onConfirm,
}: UserStatusDialogProps) {

  const name = user?.fullName || '';

  return (
    <ConfirmationDialog
      open={open}
      title={action === 'activate' ? 'Ativar usuário' : 'Desativar usuário'}
      confirmLabel={action === 'activate' ? 'Ativar' : 'Desativar'}
      onClose={onClose}
      onConfirm={onConfirm}
      minWidth='400px'
      type={action === 'activate' ? 'default' : 'danger'}
    >
      <p>
        {action === 'activate'
          ? `Deseja ativar o usuário "${name}"?`
          : `Deseja desativar o usuário "${name}"?`}
      </p>
    </ConfirmationDialog>
  );
}
