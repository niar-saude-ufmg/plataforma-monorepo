import { useState } from 'react';
import type { UserAccountStatus, UserRole } from '@niar/contracts';
import {
  ListText,
  Loading,
  niar,
  PageIntro,
  Snackbar,
  StatusChip,
  typographyStyle,
  type StatusChipStatus,
} from '@niar/ui';
import { ProfileForm, ProfileReadonly } from '../../components/Profile';
import { RoleGuard } from '../../guards/RoleGuard';
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import { selectAuthUser } from '../../store/auth/auth.slice';
import { useAppSelector } from '../../store/hooks';
import type { AuthUser } from '../../types/user.types';

const NOT_PROVIDED = 'Não informado';

// Textos da tela conforme o Figma do card.
const pageDescriptions: Partial<Record<UserRole, string>> = {
  admin: 'Gerencie seus dados pessoais e as permissões de acesso à plataforma.',
  researcher: 'Gerencie seus dados pessoais, acadêmicos e informações do COEP.',
};

// O Figma do Perfil mostra "Administrador"; o USER_ROLE_LABELS de @niar/contracts traz "Gestor" para o mesmo papel. segue o Figma.
const accessProfileLabels: Partial<Record<UserRole, string>> = {
  admin: 'Administrador',
  researcher: 'Pesquisador',
};

// O StatusChip oficial só aceita default/info/success/warning/error.
const accountStatusLabels: Record<UserAccountStatus, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  rejected: 'Recusado',
  disabled: 'Desativado',
};

const accountStatusTone: Record<UserAccountStatus, StatusChipStatus> = {
  pending: 'warning',
  active: 'success',
  rejected: 'error',
  disabled: 'default',
};

// Ritmo vertical da página usando o token de espaçamento do Design System.
const pageStyle = { display: 'grid', gap: niar.spacing.xl };

// Mesmos tokens que o ListText usa no rótulo (body2 = caption).
const statusFieldStyle = { display: 'grid', gap: niar.spacing['2xs'], justifyItems: 'start' };
const statusLabelStyle = { ...typographyStyle('caption'), color: niar.colors.text.body, margin: 0 };

const orNotProvided = (value?: string | null) =>
  value && value.trim().length > 0 ? value : NOT_PROVIDED;

// A API devolve AAAA-MM-DD; o Figma mostra DD/MM/AAAA.
const formatApprovalDate = (value?: string | null) => {
  if (!value) return NOT_PROVIDED;

  const [year, month, day] = value.slice(0, 10).split('-');
  return day && month && year ? `${day}/${month}/${year}` : value;
};

export type ProfileProps = {
  /** Papel esperado pela rota. Compõe a tela; quem autoriza é o RoleGuard. */
  role: UserRole;
  /** Reservado para o card que trouxer o carregamento da sessão por GET /auth/me. */
  sessionError?: unknown;
};

function PlatformAccess({ role, user }: { role: UserRole; user: AuthUser }) {
  return (
    <ProfileReadonly title="Acesso à plataforma">
      <ListText
        aria-label="Acesso à plataforma"
        items={[
          { label: 'Perfil de acesso', value: accessProfileLabels[role] ?? NOT_PROVIDED },
        ]}
      />
      {/* Fora do ListText: o value dele vira <p> e o StatusChip é <div>. */}
      <div style={statusFieldStyle}>
        <p style={statusLabelStyle}>Status da conta</p>
        <StatusChip
          aria-label="Status da conta"
          label={accountStatusLabels[user.accountStatus]}
          status={accountStatusTone[user.accountStatus]}
        />
      </div>
    </ProfileReadonly>
  );
}

function ResearcherDetails({ user }: { user: AuthUser }) {
  return (
    <>
      <ProfileReadonly title="Dados de contato e instituição">
        <ListText
          aria-label="Dados de contato e instituição"
          items={[
            { label: 'Instituição', value: orNotProvided(user.profile?.institution) },
            { label: 'Unidade organizacional', value: orNotProvided(user.profile?.organizationalUnit) },
            { label: 'Endereço de contato', value: orNotProvided(user.profile?.contactAddress) },
          ]}
        />
      </ProfileReadonly>

      <ProfileReadonly title="Dados acadêmicos e COEP">
        <ListText
          aria-label="Dados acadêmicos e COEP"
          items={[
            { label: 'Área de pesquisa', value: orNotProvided(user.researcherProfile?.researchArea) },
            { label: 'Número do parecer', value: orNotProvided(user.coep?.opinionNumber) },
            { label: 'Cargo / posição', value: orNotProvided(user.researcherProfile?.position) },
            { label: 'Data de aprovação', value: formatApprovalDate(user.coep?.approvalDate) },
            { label: 'CAAE', value: orNotProvided(user.coep?.caae) },
          ]}
        />
      </ProfileReadonly>
    </>
  );
}

export function Profile({ role, sessionError }: ProfileProps) {
  const user = useAppSelector(selectAuthUser);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const snackbarProps = useApiError(
    errorDismissed ? undefined : sessionError,
    () => setErrorDismissed(true),
    'Não foi possível carregar os dados do perfil.',
  );

  if (!user) {
    return (
      <>
        <Loading aria-label="Carregando perfil" />
        <Snackbar {...snackbarProps} />
      </>
    );
  }

  return (
    <RoleGuard allowedRoles={[role]}>
      <div style={pageStyle}>
        <PageIntro title="Perfil" description={pageDescriptions[role]} />

        <ProfileForm role={role} user={user} mode="readonly" />

        {role === 'admin' && <PlatformAccess role={role} user={user} />}
        {role === 'researcher' && <ResearcherDetails user={user} />}
      </div>

      <Snackbar {...snackbarProps} />
    </RoleGuard>
  );
}
