import { useEffect, useState } from 'react';
import type { UserAccountStatus } from '@niar/contracts';
import {
  Button,
  ListText,
  Loading,
  PageIntro,
  Snackbar,
  StatusChip,
  type StatusChipStatus,
} from '@niar/ui';
import { ChangePasswordForm, ProfileForm, ProfileReadonly } from '../../components/Profile';
import type { ChangePasswordSubmitValues } from '../../components/Profile';
import type { ProfileFormValues } from '../../components/Profile';
import { RoleGuard } from '../../guards/RoleGuard';
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import { changePassword, updateProfile } from '../../store/auth/auth.api';
import {
  selectAuthMutationError,
  selectAuthMutationOperation,
  selectAuthMutationStatus,
  selectAuthSelected,
} from '../../store/auth/auth.selectors';
import { clearAuthMutation } from '../../store/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { downloadUserCoepDocument } from '../../store/users/users.api';
import { clearUsersError } from '../../store/users/users.slice';
import {
  selectUsersDownloadError,
  selectUsersDownloadLoading,
} from '../../store/users/users.selectors';
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

function ResearcherDetails({
  user,
  canDownloadCoep,
  downloading,
  onDownloadCoep,
}: {
  user: AuthUser;
  canDownloadCoep: boolean;
  downloading: boolean;
  onDownloadCoep: () => void;
}) {
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
        {canDownloadCoep && (
          <div className="profile__coep-actions">
            <Button variant="outlined" onClick={onDownloadCoep} disabled={downloading}>
              Baixar
            </Button>
          </div>
        )}
      </ProfileReadonly>
    </>
  );
}

export function Profile({ role, sessionError }: ProfileProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthSelected);
  const mutationStatus = useAppSelector(selectAuthMutationStatus);
  const mutationOperation = useAppSelector(selectAuthMutationOperation);
  const mutationError = useAppSelector(selectAuthMutationError);
  const downloading = useAppSelector(selectUsersDownloadLoading);
  const downloadError = useAppSelector(selectUsersDownloadError);

  const roleConfig = PROFILE_ROLE_CONFIG[role];
  const [mode, setMode] = useState<'readonly' | 'edit'>('readonly');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const savingProfile = mutationStatus === 'pending' && mutationOperation === 'updateProfile';
  const savingPassword = mutationStatus === 'pending' && mutationOperation === 'changePassword';

  // Fecha o formulário correspondente assim que a operação conclui.
  useEffect(() => {
    if (mutationStatus !== 'succeeded') return;

    if (mutationOperation === 'updateProfile') {
      setMode('readonly');
      setFeedback('Perfil atualizado.');
    }

    if (mutationOperation === 'changePassword') {
      setPasswordOpen(false);
      setFeedback('Senha atualizada.');
    }

    dispatch(clearAuthMutation());
  }, [dispatch, mutationOperation, mutationStatus]);

  const apiError = errorDismissed ? undefined : (sessionError ?? mutationError ?? downloadError);
  const snackbarProps = useApiError(
    apiError,
    () => {
      setErrorDismissed(true);
      dispatch(clearAuthMutation());
      dispatch(clearUsersError());
    },
    'Não foi possível concluir a operação. Tente novamente.',
  );

  useEffect(() => {
    setErrorDismissed(false);
  }, [mutationError, downloadError]);

  if (!user) {
    return (
      <>
        <Loading aria-label="Carregando perfil" />
        <Snackbar {...snackbarProps} />
      </>
    );
  }

  const handleSubmitProfile = (values: ProfileFormValues) => {
    dispatch(updateProfile(values));
  };

  const handleSubmitPassword = (values: ChangePasswordSubmitValues) => {
    dispatch(changePassword(values));
  };

  const canEdit = roleConfig.actions.includes('editProfile');
  const canChangePassword = roleConfig.actions.includes('changePassword');
  const canDownloadCoep =
    roleConfig.actions.includes('downloadCoep') && Boolean(user.coep?.documentFilename);

  const headerActions = mode === 'readonly' && !passwordOpen ? (
    <>
      {canChangePassword && (
        <Button color="secondary" size="small" variant="outlined" onClick={() => setPasswordOpen(true)}>
          Trocar senha
        </Button>
      )}
      {canEdit && (
        <Button color="secondary" size="small" variant="outlined" onClick={() => setMode('edit')}>
          Editar perfil
        </Button>
      )}
    </>
  ) : null;

  return (
    <RoleGuard allowedRoles={[role]}>
      <div className="profile">
        <PageIntro
          title={mode === 'edit' ? 'Editar perfil' : 'Perfil'}
          description={
            mode === 'edit'
              ? 'Atualize os dados editáveis do seu perfil.'
              : roleConfig.description
          }
        />

        {roleConfig.sections.includes('account') && (
          <ProfileForm
            role={role}
            user={user}
            mode={mode}
            editableFields={roleConfig.editableFields}
            actions={headerActions}
            submitting={savingProfile}
            onSubmit={handleSubmitProfile}
            onCancel={() => setMode('readonly')}
          />
        )}

        {passwordOpen && (
          <ChangePasswordForm
            submitting={savingPassword}
            onSubmit={handleSubmitPassword}
            onCancel={() => setPasswordOpen(false)}
          />
        )}

        {roleConfig.sections.includes('access') && <PlatformAccess role={role} user={user} />}
        {roleConfig.sections.includes('researcherDetails') && (
          <ResearcherDetails
            user={user}
            canDownloadCoep={canDownloadCoep}
            downloading={downloading}
            onDownloadCoep={() => dispatch(downloadUserCoepDocument(user.id))}
          />
        )}
      </div>

      <Snackbar {...snackbarProps} />
      <Snackbar
        open={Boolean(feedback)}
        message={feedback ?? ''}
        severity="success"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setFeedback(null)}
      />
    </RoleGuard>
  );
}
