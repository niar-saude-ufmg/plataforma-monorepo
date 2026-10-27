import { Button, Form, Input } from '@niar/ui';
import type { ReactNode } from 'react';
import type { ProfileFormFields } from '../../../hooks/forms/use-profile-form/use-profile-form';
import './ProfileForm.scss';

export type { ProfileFormValues } from '../../../hooks/forms/use-profile-form/use-profile-form';

export type ProfileFormProps = {
  mode: 'readonly' | 'edit';
  fields: ProfileFormFields;
  showPhone: boolean;
  /** Botões do cabeçalho em readonly; a página decide quais ações o papel tem. */
  actions?: ReactNode;
  submitting?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function ProfileForm({
  mode,
  fields,
  showPhone,
  actions,
  submitting = false,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const isReadonly = mode === 'readonly';

  return (
    <div className="profile-form">
      <Form aria-level={2}>
        <div className="profile-form__content">
          <div className="profile-form__header">
            <h2 className="profile-form__title">Dados da conta</h2>
            {isReadonly && actions ? (
              <div className="profile-form__actions">{actions}</div>
            ) : null}
          </div>

          <div className="profile-form__account-grid">
            <Input
              {...fields.fullName}
              label="Nome completo"
              autoComplete="name"
              disabled={isReadonly || submitting}
              required={!isReadonly}
              fullWidth
            />
            <Input
              {...fields.email}
              label="E-mail"
              type="email"
              autoComplete="email"
              disabled={isReadonly || submitting}
              required={!isReadonly}
              fullWidth
            />
            {showPhone && (
              <Input
                {...fields.phone}
                label="Telefone"
                type="tel"
                autoComplete="tel"
                disabled={isReadonly || submitting}
                required={!isReadonly}
                fullWidth
              />
            )}
          </div>

          {!isReadonly && (
            <div className="profile-form__footer">
              <Button
                color="secondary"
                size="small"
                variant="outlined"
                type="button"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button size="small" variant="contained" onClick={onSubmit} disabled={submitting}>
                Salvar
              </Button>
            </div>
          )}
        </div>
      </Form>
    </div>
  );
}
