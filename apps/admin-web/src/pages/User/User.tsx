import { Alert, Button, Form, Snackbar } from '@niar/ui';
import { useEffect, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoepUserForm } from '../../components/UserForm/CoepUserForm/CoepUserForm';
import { CommitteeProfileForm } from '../../components/UserForm/CommitteeProfileForm/CommitteeProfileForm';
import { ResearcherProfileForm } from '../../components/UserForm/ResearcherProfileForm/ResearcherProfileForm';
import { SelectRoleForm } from '../../components/UserForm/SelectRoleForm/SelectRoleForm';
import { SharedUserForm } from '../../components/UserForm/SharedUserForm/SharedUserForm';
import { useCommitteeForm } from '../../hooks/forms/use-committee-form/use-committee-form';
import { useResearcherForm } from '../../hooks/forms/use-researcher-form/use-researcher-form';
import { useRoleForm } from '../../hooks/forms/use-role-form/use-role-form';
import { useSharedUserForm } from '../../hooks/forms/use-shared-user-form/use-shared-user-form';
import { textFieldProps } from '../../hooks/forms/utils/props';
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSpecialties } from '../../store/specialties/specialties.api';
import {
  selectSpecialtiesList,
  selectSpecialtiesListError,
  selectSpecialtiesListLoading,
} from '../../store/specialties/specialties.selectors';
import {
  createAdministrator,
  createAuditor,
  createCommitteeMember,
  createResearcher,
} from '../../store/users/users.api';
import {
  selectUsersMutationError,
  selectUsersMutationLoading,
} from '../../store/users/users.selectors';
import { clearUsersMutationError } from '../../store/users/users.slice';
import type {
  CoepUserFormFields,
  CommitteeProfileFormFields,
  ResearcherProfileFormFields,
  RoleFormFields,
  SharedUserFormFields,
  UserRole,
} from '../../types/user.types';
import { formatBrazilianPhone } from '../../utils/formatters/phone';
import { USER_ROLE_CONFIG, USER_ROLE_OPTIONS, type UserRoleProfile } from './User.role';
import './User.scss';
import { userSchema } from './User.validators';

const USERS_LIST_ROUTE = '/admin/administrador/usuarios';
const FALLBACK_MESSAGE = 'Não foi possível cadastrar o usuário. Tente novamente.';

type ProfileFields = {
  researcher: ResearcherProfileFormFields;
  coep: CoepUserFormFields;
  committee: CommitteeProfileFormFields;
};

const profileRenderers: Record<UserRoleProfile, (fields: ProfileFields) => ReactNode> = {
  none: () => null,
  researcher: (fields) => (
    <>
      <ResearcherProfileForm fields={fields.researcher} />
      <CoepUserForm fields={fields.coep} />
    </>
  ),
  committee: (fields) => <CommitteeProfileForm fields={fields.committee} />,
};

export function User() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectUsersMutationLoading);
  const apiError = useAppSelector(selectUsersMutationError);
  const specialties = useAppSelector(selectSpecialtiesList);
  const specialtiesLoading = useAppSelector(selectSpecialtiesListLoading);
  const specialtiesError = useAppSelector(selectSpecialtiesListError);

  const form = useSharedUserForm({ schema: userSchema });
  const { fields, handleSubmit, reset, applyApiFieldErrors, fieldError } = form;
  const { fields: roleFormFields } = useRoleForm(form.control);
  const { fields: researcherFormFields } = useResearcherForm(form.control);
  const { fields: committeeFormFields } = useCommitteeForm(form.control);
  const {
    fullName,
    email,
    password,
    passwordConfirmation,
  } = fields;
  const {
    phone,
    institution,
    organizationalUnit,
    contactAddress,
    researchArea,
    position,
    caae,
    opinionNumber,
    approvalDate,
    coepDocument,
  } = researcherFormFields;
  const { specialtyId } = committeeFormFields;

  const { role } = roleFormFields;
  const selectedRole = role.field.value as UserRole | '';
  const roleConfig = selectedRole
    ? USER_ROLE_CONFIG[selectedRole]
    : {
      label: '',
      description: 'Selecione o tipo de usuário para continuar o cadastro.',
      profile: 'none' as const,
    };

  useEffect(() => {
    if (selectedRole === 'committee') {
      dispatch(fetchSpecialties({ isActive: true }));
    }
  }, [dispatch, selectedRole]);

  useEffect(() => {
    if (apiError) applyApiFieldErrors(apiError);
  }, [apiError, applyApiFieldErrors]);

  useEffect(() => () => {
    dispatch(clearUsersMutationError());
  }, [dispatch]);

  const sharedFields: SharedUserFormFields = {
    fullName: textFieldProps(fullName.field, fieldError('fullName')),
    email: textFieldProps(email.field, fieldError('email')),
    password: textFieldProps(password.field, fieldError('password')),
    passwordConfirmation: textFieldProps(passwordConfirmation.field, fieldError('passwordConfirmation')),
  };

  const researcherFields: ResearcherProfileFormFields = {
    phone: textFieldProps(phone.field, fieldError('phone'), formatBrazilianPhone),
    institution: textFieldProps(institution.field, fieldError('institution')),
    organizationalUnit: textFieldProps(organizationalUnit.field, fieldError('organizationalUnit')),
    contactAddress: textFieldProps(contactAddress.field, fieldError('contactAddress')),
    researchArea: textFieldProps(researchArea.field, fieldError('researchArea')),
    position: textFieldProps(position.field, fieldError('position')),
  };

  const coepFields: CoepUserFormFields = {
    caae: textFieldProps(caae.field, fieldError('caae')),
    opinionNumber: textFieldProps(opinionNumber.field, fieldError('opinionNumber')),
    approvalDate: textFieldProps(approvalDate.field, fieldError('approvalDate')),
    coepDocument: {
      onChange: (file) => coepDocument.field.onChange(file),
      error: fieldError('coepDocument'),
    },
  };

  const specialtyOptions = useMemo(
    () => specialties.map((specialty) => ({
      label: specialty.name,
      value: String(specialty.id),
    })),
    [specialties],
  );

  const committeeFields: CommitteeProfileFormFields = {
    specialtyId: {
      name: 'specialtyId',
      value: specialtyId.field.value,
      options: specialtyOptions,
      onChange: specialtyId.field.onChange,
      onBlur: specialtyId.field.onBlur,
      loading: specialtiesLoading,
      error: Boolean(fieldError('specialtyId')),
      helperText: fieldError('specialtyId'),
    },
  };

  const roleFields: RoleFormFields = {
    role: {
      name: 'role',
      value: selectedRole,
      options: USER_ROLE_OPTIONS,
      onChange: (nextRole) => role.field.onChange(nextRole),
      onBlur: role.field.onBlur,
      error: Boolean(fieldError('role')),
      helperText: fieldError('role'),
    },
  };

  const submit = handleSubmit(async (values) => {
    if (!selectedRole) return;

    if (selectedRole === 'researcher') {
      const result = await dispatch(createResearcher({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        profile: {
          phone: values.phone,
          institution: values.institution,
          organizationalUnit: values.organizationalUnit,
          contactAddress: values.contactAddress,
        },
        researcherProfile: {
          researchArea: values.researchArea,
          position: values.position,
        },
        coep: {
          caae: values.caae,
          opinionNumber: values.opinionNumber,
          approvalDate: values.approvalDate,
          document: values.coepDocument as File,
        },
      }));

      if (result.meta.requestStatus === 'fulfilled') {
        reset();
        navigate(USERS_LIST_ROUTE);
      }
      return;
    }

    if (selectedRole === 'admin') {
      const result = await dispatch(createAdministrator({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      }));

      if (result.meta.requestStatus === 'fulfilled') {
        reset();
        navigate(USERS_LIST_ROUTE);
      }
      return;
    }

    if (selectedRole === 'auditor') {
      const result = await dispatch(createAuditor({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      }));

      if (result.meta.requestStatus === 'fulfilled') {
        reset();
        navigate(USERS_LIST_ROUTE);
      }
      return;
    }

    const result = await dispatch(createCommitteeMember({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      specialtyId: Number(values.specialtyId?.value),
    }));

    if (result.meta.requestStatus === 'fulfilled') {
      reset();
      navigate(USERS_LIST_ROUTE);
    }
  });

  const errorSnackbar = useApiError(
    apiError,
    () => dispatch(clearUsersMutationError()),
    FALLBACK_MESSAGE,
  );

  return (
    <div className="user-page">
      <Form title="Cadastrar usuário" description={roleConfig.description} aria-level={1}>
        <div className="user-page__body">
          <SharedUserForm fields={sharedFields} alert={roleConfig.alert} />
          <SelectRoleForm fields={roleFields} />
          {profileRenderers[roleConfig.profile]({
            researcher: researcherFields,
            coep: coepFields,
            committee: committeeFields,
          })}
          {specialtiesError && selectedRole === 'committee' ? (
            <Alert severity="error">Não foi possível carregar as especialidades.</Alert>
          ) : null}
          <div className="user-page__actions">
            <Button variant="outlined" color="primary" onClick={() => navigate(USERS_LIST_ROUTE)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={isLoading}
              onClick={() => { void submit(); }}
            >
              {isLoading ? 'Cadastrando…' : 'Cadastrar'}
            </Button>
          </div>
        </div>
      </Form>
      <Snackbar {...errorSnackbar} />
    </div>
  );
}
