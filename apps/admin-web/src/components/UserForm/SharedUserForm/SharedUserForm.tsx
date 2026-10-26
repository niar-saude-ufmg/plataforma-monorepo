import { Alert, Input, type AlertProps } from '@niar/ui';
import type { ReactNode } from 'react';
import type { SharedUserFormFields } from '../../../types/user.types';
import './SharedUserForm.scss';

type SharedUserFormProps = {
  fields: SharedUserFormFields;
  alert?: {
    severity: NonNullable<AlertProps['severity']>;
    message: ReactNode;
  };
};

export function SharedUserForm({ fields, alert }: SharedUserFormProps) {
  return (
    <section className="shared-user-form" aria-labelledby="personal-data-title">
      <h3 id="personal-data-title">Dados de acesso</h3>
      {alert ? <Alert severity={alert.severity}>{alert.message}</Alert> : null}
      <div className="shared-user-form__grid">
        <Input {...fields.fullName} label="Nome completo" autoComplete="name" required fullWidth />
        <Input
          {...fields.email}
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="nome@instituicao.org"
          required
          fullWidth
        />
        <Input {...fields.password} label="Senha" type="password" autoComplete="new-password" showPasswordLabel="Mostrar" hidePasswordLabel="Ocultar" required fullWidth />
        <Input {...fields.passwordConfirmation} label="Repetir senha" type="password" autoComplete="new-password" showPasswordLabel="Mostrar" hidePasswordLabel="Ocultar" required fullWidth />
      </div>
    </section>
  );
}
