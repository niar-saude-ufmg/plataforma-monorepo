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
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import {
  useChangePasswordForm,
  type ChangePasswordSubmitValues,
} from '../../hooks/forms/use-change-password-form/use-change-password-form';
import {
  useProfileForm,
  type ProfileFormValues,
} from '../../hooks/forms/use-profile-form/use-profile-form';
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
import type { ProfileRoleConfig } from '../../types/role-profile';
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

function PlatformAccess({ roleConfig, user }: { roleConfig: ProfileRoleConfig; user: AuthUser }) {
  return (
    <ProfileReadonly title="Acesso à plataforma">
      <ListText
        aria-label="Acesso à plataforma"
        items={[
          { label: 'Perfil de acesso', value: roleConfig.accessProfileLabel },
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
      <ProfileReadonly title="Dados acadêmicos e institucionais">
        <div className="profile__academic-grid">
          <ListText
            aria-label="Dados acadêmicos e institucionais — coluna 1"
            items={[
              { label: 'Área de pesquisa', value: orNotProvided(user.researcherProfile?.researchArea) },
              { label: 'Cargo / posição', value: orNotProvided(user.researcherProfile?.position) },
              { label: 'Instituição', value: orNotProvided(user.profile?.institution) },
            ]}
          />
          <ListText
            aria-label="Dados acadêmicos e institucionais — coluna 2"
            items={[
              { label: 'Unidade organizacional', value: orNotProvided(user.profile?.organizationalUnit) },
              { label: 'Endereço de contato', value: orNotProvided(user.profile?.contactAddress) },
            ]}
          />
        </div>
      </ProfileReadonly>

      <ProfileReadonly title="Dados de avaliação no COEP">
        <div className="profile__academic-grid">
          <ListText
            aria-label="Dados de avaliação no COEP — coluna 1"
            items={[
              { label: 'CAAE', value: orNotProvided(user.coep?.caae) },
              { label: 'Nome do arquivo', value: orNotProvided(user.coep?.documentFilename) },
            ]}
          />
          <ListText
            aria-label="Dados de avaliação no COEP — coluna 2"
            items={[
              { label: 'Número do parecer', value: orNotProvided(user.coep?.opinionNumber) },
              { label: 'Data de aprovação', value: formatApprovalDate(user.coep?.approvalDate) },
            ]}
          />
        </div>
        {canDownloadCoep && (
          <div className="profile__coep-actions">
            <Button color="secondary" variant="outlined" onClick={onDownloadCoep} disabled={downloading}>
              Baixar
            </Button>
          </div>
        )}
      </ProfileReadonly>
    </>
  );
}

export function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthSelected);
  const mutationStatus = useAppSelector(selectAuthMutationStatus);
  const mutationOperation = useAppSelector(selectAuthMutationOperation);
  const mutationError = useAppSelector(selectAuthMutationError);
  const downloading = useAppSelector(selectUsersDownloadLoading);
  const downloadError = useAppSelector(selectUsersDownloadError);

  const roleConfig = user ? PROFILE_ROLE_CONFIG[user.role] : undefined;
  const profileForm = useProfileForm({
    user,
    fields: roleConfig?.fields,
  });
  const passwordForm = useChangePasswordForm();
  const [mode, setMode] = useState<'readonly' | 'edit'>('readonly');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const savingProfile = mutationStatus === 'pending' && mutationOperation === 'updateProfile';
  const savingPassword = mutationStatus === 'pending' && mutationOperation === 'changePassword';

  useEffect(() => {
    if (!mutationError) return;

    if (mutationOperation === 'updateProfile') {
      profileForm.applyApiFieldErrors(mutationError);
    }

    if (mutationOperation === 'changePassword') {
      passwordForm.applyApiFieldErrors(mutationError);
    }
  }, [
    mutationError,
    mutationOperation,
    passwordForm.applyApiFieldErrors,
    profileForm.applyApiFieldErrors,
  ]);

  // Fecha o formulário correspondente assim que a operação conclui.
  useEffect(() => {
    if (mutationStatus !== 'succeeded') return;

    if (mutationOperation === 'updateProfile') {
      setMode('readonly');
      setFeedback('Perfil atualizado.');
    }

    if (mutationOperation === 'changePassword') {
      passwordForm.reset();
      setPasswordOpen(false);
      setFeedback('Senha atualizada.');
    }

    dispatch(clearAuthMutation());
  }, [dispatch, mutationOperation, mutationStatus]);

  const closeSnackbar = () => {
    setErrorDismissed(true);
    setFeedback(null);
    dispatch(clearAuthMutation());
    dispatch(clearUsersError());
  };

  const apiError = errorDismissed ? undefined : (mutationError ?? downloadError);
  const apiErrorSnackbar = useApiError(
    apiError,
    closeSnackbar,
    'Não foi possível concluir a operação. Tente novamente.',
  );
  const snackbarProps = apiError
    ? apiErrorSnackbar
    : {
        ...apiErrorSnackbar,
        open: Boolean(feedback),
        message: feedback ?? '',
        severity: 'success' as const,
      };

  useEffect(() => {
    setErrorDismissed(false);
  }, [mutationError, downloadError]);

  const submitProfile = profileForm.handleSubmit((values: ProfileFormValues) => {
    if (!user) return;

    dispatch(updateProfile({
      fullName: values.fullName,
      email: values.email,
      ...(roleConfig?.fields.phone.editable ? { phone: values.phone } : {}),
    }));
  });

  const submitPassword = passwordForm.handleSubmit((values: ChangePasswordSubmitValues) => {
    dispatch(changePassword(values));
  });

  if (!user) {
    return (
      <>
        <Loading aria-label="Carregando perfil" />
        <Snackbar {...snackbarProps} />
      </>
    );
  }

  if (!roleConfig) return null;

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
    <>
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
            mode={mode}
            fields={profileForm.fields}
            showPhone={roleConfig.fields.phone.visible}
            actions={headerActions}
            submitting={savingProfile}
            onSubmit={() => { void submitProfile(); }}
            onCancel={() => {
              profileForm.reset();
              setMode('readonly');
            }}
          />
        )}

        {passwordOpen && (
          <ChangePasswordForm
            fields={passwordForm.fields}
            submitting={savingPassword}
            onSubmit={() => { void submitPassword(); }}
            onCancel={() => {
              passwordForm.reset();
              setPasswordOpen(false);
            }}
          />
        )}

        {roleConfig.sections.includes('access') && <PlatformAccess roleConfig={roleConfig} user={user} />}
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
    </>
  );
}
