import { Button, Form, Input } from '@niar/ui';
import type {
  ChangePasswordFormFields,
  ChangePasswordFormValues,
  ChangePasswordSubmitValues,
} from '../../../hooks/forms/use-change-password-form/use-change-password-form';
import './ChangePasswordForm.scss';

export type { ChangePasswordFormValues, ChangePasswordSubmitValues };

export type ChangePasswordFormProps = {
  fields: ChangePasswordFormFields;
  submitting?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function ChangePasswordForm({
  fields,
  submitting = false,
  onSubmit,
  onCancel,
}: ChangePasswordFormProps) {
  return (
    <div className="change-password-form">
      <Form aria-level={2}>
        <div className="change-password-form__content">
          <h2 className="change-password-form__title">Trocar senha</h2>

          <div className="change-password-form__grid">
            <Input
              {...fields.currentPassword}
              label="Senha atual"
              type="password"
              autoComplete="current-password"
              disabled={submitting}
              fullWidth
            />
            <Input
              {...fields.password}
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              disabled={submitting}
              fullWidth
            />
            <Input
              {...fields.passwordConfirmation}
              label="Repetir senha"
              type="password"
              autoComplete="new-password"
              disabled={submitting}
              fullWidth
            />
          </div>

          <div className="change-password-form__footer">
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
              Trocar senha
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
