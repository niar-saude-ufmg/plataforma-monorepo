import type { UserRole } from '@niar/contracts';
import { Form, Input } from '@niar/ui';
import type { AuthUser } from '../../../types/user.types';
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
  // Previstos pelo contrato do card; o submit e os botões entram na tarefa seguinte.
  onSubmit?: (values: ProfileFormValues) => void;
  onCancel?: () => void;
};

export function ProfileForm({ role, user, mode }: ProfileFormProps) {
  // O Input oficial não expõe readOnly (slotProps é omitido do tipo) disabled é o estado oficial de campo não editável.
  const isReadonly = mode === 'readonly';

  return (
    <div className="profile-form">
      <Form aria-level={2}>
        <div className="profile-form__content">
          <h2 className="profile-form__title">Dados da conta</h2>
          <div className="profile-form__account-grid">
            <Input
              name="fullName"
              label="Nome completo"
              autoComplete="name"
              defaultValue={user.name}
              disabled={isReadonly}
              fullWidth
              margin="normal"
            />
            <Input
              name="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              defaultValue={user.email}
              disabled={isReadonly}
              fullWidth
              margin="normal"
            />
            {role === 'researcher' && (
              <Input
                name="phone"
                label="Telefone"
                type="tel"
                autoComplete="tel"
                defaultValue={user.profile?.phone ?? ''}
                disabled={isReadonly}
                fullWidth
                margin="normal"
              />
            )}
          </div>
        </div>
      </Form>
    </div>
  );
}
