import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useController } from 'react-hook-form';
import { z } from 'zod';
import type { UserRole } from '@niar/contracts';
import { Button, Form, Input } from '@niar/ui';
import { useForm } from '../../../hooks/forms/use-form/use-form';
import { textFieldProps } from '../../../hooks/forms/utils/props';
import type { AuthUser } from '../../../types/user.types';
import type { ProfileFieldId } from '../../../types/role-profile';
import './ProfileForm.scss';

export type ProfileFormValues = {
  fullName: string;
  email: string;
  phone?: string;
};

export type ProfileFormProps = {
  role: UserRole;
  user: AuthUser;
  mode: 'readonly' | 'edit';
  /** Campos que este papel pode editar. Também define se o telefone aparece. */
  editableFields?: readonly ProfileFieldId[];
  /** Botões do cabeçalho em readonly; a página decide quais ações o papel tem. */
  actions?: ReactNode;
  submitting?: boolean;
  onSubmit?: (values: ProfileFormValues) => void;
  onCancel?: () => void;
};

const profileFormSchema = z.object({
  fullName: z.string().trim().min(1, { message: 'Informe o nome completo.' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Informe o e-mail.' })
    .email({ message: 'Informe um e-mail válido, como nome@instituicao.org.' }),
  phone: z.string().trim().optional(),
});

const DEFAULT_EDITABLE_FIELDS: readonly ProfileFieldId[] = ['fullName', 'email'];

const toFormValues = (user: AuthUser): ProfileFormValues => ({
  fullName: user.name,
  email: user.email,
  phone: user.profile?.phone ?? '',
});

export function ProfileForm({
  role,
  user,
  mode,
  editableFields = DEFAULT_EDITABLE_FIELDS,
  actions,
  submitting = false,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  // O Input oficial não expõe readOnly (slotProps é omitido do tipo);
  // disabled é o estado oficial de campo não editável.
  const isReadonly = mode === 'readonly';
  const showPhone = editableFields.includes('phone');

  const form = useForm<ProfileFormValues>({
    schema: profileFormSchema,
    defaultValues: toFormValues(user),
  });
  const { control, handleSubmit, reset, fieldError } = form;

  // textFieldProps entrega value ao Input; sem ele o label não sobe.
  const fields = {
    fullName: textFieldProps(useController({ control, name: 'fullName' }).field, fieldError('fullName')),
    email: textFieldProps(useController({ control, name: 'email' }).field, fieldError('email')),
    phone: textFieldProps(useController({ control, name: 'phone' }).field, fieldError('phone')),
  };

  // Cancelar e trocas de usuário voltam aos valores originais da sessão.
  useEffect(() => {
    reset(toFormValues(user));
  }, [reset, user, mode]);

  const submit = handleSubmit((values) => {
    onSubmit?.({
      fullName: values.fullName,
      email: values.email,
      ...(showPhone ? { phone: values.phone } : {}),
    });
  });

  const handleCancel = () => {
    reset(toFormValues(user));
    onCancel?.();
  };

  return (
    <div className="profile-form">
      <Form aria-level={2}>
        <form className="profile-form__content" onSubmit={submit} noValidate>
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
              fullWidth
            />
            <Input
              {...fields.email}
              label="E-mail"
              type="email"
              autoComplete="email"
              disabled={isReadonly || submitting}
              fullWidth
            />
            {(showPhone || role === 'researcher') && (
              <Input
                {...fields.phone}
                label="Telefone"
                type="tel"
                autoComplete="tel"
                disabled={isReadonly || submitting}
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
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button size="small" variant="contained" type="submit" disabled={submitting}>
                Salvar
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
