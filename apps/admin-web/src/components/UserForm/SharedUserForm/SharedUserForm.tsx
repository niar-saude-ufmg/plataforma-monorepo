import { Input } from '@niar/ui';
import type { SharedUserFormFields } from '../../../types/user.types';
import './SharedUserForm.scss';

type SharedUserFormProps = {
  fields: SharedUserFormFields;
};

export function SharedUserForm({ fields }: SharedUserFormProps) {
  return (
    <section className="shared-user-form" aria-labelledby="personal-data-title">
      <h3 id="personal-data-title">Dados de acesso</h3>
      <div className="shared-user-form__grid">
        <Input {...fields.fullName} label="Nome completo" autoComplete="name" fullWidth />
        <Input
          {...fields.email}
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="nome@instituicao.org"
          fullWidth
        />
        <Input {...fields.password} label="Senha" type="password" autoComplete="new-password" showPasswordLabel="Mostrar" hidePasswordLabel="Ocultar" fullWidth />
        <Input {...fields.passwordConfirmation} label="Repetir senha" type="password" autoComplete="new-password" showPasswordLabel="Mostrar" hidePasswordLabel="Ocultar" fullWidth />
      </div>
    </section>
  );
}
