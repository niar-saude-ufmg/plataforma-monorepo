import type { UserRole } from '@niar/contracts';
import { Form, Input, niar, typographyStyle } from '@niar/ui';
import type { AuthUser } from '../../../types/user.types';

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

// Mesmo título do ProfileReadonly: dentro do card, como no Figma. o title do Form renderiza um PageIntro (h1) acima do Card.
const titleStyle = {
  ...typographyStyle('title'),
  color: niar.colors.text.heading,
  margin: 0,
};

export function ProfileForm({ role, user, mode }: ProfileFormProps) {
  // O Input oficial não expõe readOnly (slotProps é omitido do tipo) disabled é o estado oficial de campo não editável.
  const isReadonly = mode === 'readonly';

  return (
    <Form aria-level={2}>
      <h2 style={titleStyle}>Dados da conta</h2>
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
    </Form>
  );
}
