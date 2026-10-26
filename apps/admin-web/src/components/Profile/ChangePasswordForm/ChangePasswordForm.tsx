import { useController } from 'react-hook-form';
import { z } from 'zod';
import { Button, Form, Input } from '@niar/ui';
import { useForm } from '../../../hooks/forms/use-form/use-form';
import { textFieldProps } from '../../../hooks/forms/utils/props';
import './ChangePasswordForm.scss';

export type ChangePasswordFormValues = {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
};

/** Só currentPassword e password vão para a API. */
export type ChangePasswordSubmitValues = {
  currentPassword: string;
  password: string;
};

export type ChangePasswordFormProps = {
  submitting?: boolean;
  onSubmit?: (values: ChangePasswordSubmitValues) => void;
  onCancel?: () => void;
};

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Informe a senha atual.' }),
    password: z.string().min(8, { message: 'A nova senha precisa ter pelo menos 8 caracteres.' }),
    passwordConfirmation: z.string().min(1, { message: 'Repita a nova senha.' }),
  })
  // Confirmação é validação só do formulário; nunca é enviada à API.
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'As senhas não conferem.',
    path: ['passwordConfirmation'],
  });

const emptyValues: ChangePasswordFormValues = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
};

export function ChangePasswordForm({
  submitting = false,
  onSubmit,
  onCancel,
}: ChangePasswordFormProps) {
  const { control, handleSubmit, reset, fieldError } = useForm<ChangePasswordFormValues>({
    schema: changePasswordSchema,
    defaultValues: emptyValues,
  });

  // textFieldProps entrega value ao Input; sem ele o label não sobe.
  const fields = {
    currentPassword: textFieldProps(
      useController({ control, name: 'currentPassword' }).field,
      fieldError('currentPassword'),
    ),
    password: textFieldProps(useController({ control, name: 'password' }).field, fieldError('password')),
    passwordConfirmation: textFieldProps(
      useController({ control, name: 'passwordConfirmation' }).field,
      fieldError('passwordConfirmation'),
    ),
  };

  const submit = handleSubmit((values) => {
    onSubmit?.({ currentPassword: values.currentPassword, password: values.password });
  });

  const handleCancel = () => {
    reset(emptyValues);
    onCancel?.();
  };

  return (
    <div className="change-password-form">
      <Form aria-level={2}>
        <form className="change-password-form__content" onSubmit={submit} noValidate>
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
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button size="small" variant="contained" type="submit" disabled={submitting}>
              Trocar senha
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
