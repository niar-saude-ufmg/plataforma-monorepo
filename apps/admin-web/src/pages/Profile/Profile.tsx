import { useState } from 'react';
import type { UserAccountStatus } from '@niar/contracts';
import {
  ListText,
  Loading,
  PageIntro,
  Snackbar,
  StatusChip,
  type StatusChipStatus,
} from '@niar/ui';
import { ProfileForm, ProfileReadonly } from '../../components/Profile';
import { RoleGuard } from '../../guards/RoleGuard';
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import { selectAuthSelected } from '../../store/auth/auth.selectors';
import { useAppSelector } from '../../store/hooks';
import type { AuthUser } from '../../types/user.types';
import type { ProfileRole } from '../../types/role-profile';
import { PROFILE_ROLE_CONFIG } from './Profile.roles';
import './Profile.scss';

const NOT_PROVIDED = 'Não informado';

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
  role: ProfileRole;
  /** Reservado para o card que trouxer o carregamento da sessão por GET /auth/me. */
  sessionError?: unknown;
};

function PlatformAccess({ role, user }: { role: ProfileRole; user: AuthUser }) {
  return (
    <ProfileReadonly title="Acesso à plataforma">
      <ListText
        aria-label="Acesso à plataforma"
        items={[
          { label: 'Perfil de acesso', value: PROFILE_ROLE_CONFIG[role].accessProfileLabel },
        ]}
      />
      {/* Fora do ListText: o value dele vira <p> e o StatusChip é <div>. */}
      <div className="profile__status-field">
        <p className="profile__status-label">Status da conta</p>
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
  const user = useAppSelector(selectAuthSelected);
  const roleConfig = PROFILE_ROLE_CONFIG[role];
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
      <div className="profile">
        <PageIntro title="Perfil" description={roleConfig.description} />

        <ProfileForm role={role} user={user} mode="readonly" />

        {roleConfig.sections.includes('access') && <PlatformAccess role={role} user={user} />}
        {roleConfig.sections.includes('researcherDetails') && <ResearcherDetails user={user} />}
      </div>

      <Snackbar {...snackbarProps} />
    </RoleGuard>
  );
}
