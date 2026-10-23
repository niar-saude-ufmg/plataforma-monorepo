import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useController } from 'react-hook-form';
import { Button, Snackbar } from '@niar/ui';
import { useForm } from '../../../hooks/forms/use-form/use-form';
import { textFieldProps } from '../../../hooks/forms/utils/props';
import { useApiError } from '../../../hooks/use-api-error/use-api-error';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createCommitteeMember } from '../../../store/users/users.api';
import { clearUsersMutationError } from '../../../store/users/users.slice';
import {
  selectUsersMutationError,
  selectUsersMutationLoading,
} from '../../../store/users/users.selectors';
import {
  selectSpecialtiesList,
  selectSpecialtiesListLoading,
  selectSpecialtiesListError,
} from '../../../store/specialties/specialties.selectors';
import { fetchSpecialties } from '../../../store/specialties/specialties.api';
import type {
  CommitteeProfileFormFields,
  SharedUserFormFields,
} from '../../../types/user.types';
import { SharedUserForm } from '../../../components/UserForm/SharedUserForm/SharedUserForm';
import { CommitteeProfileForm } from '../../../components/UserForm/CommitteeProfileForm/CommitteeProfileForm';
import {
  committeeSchema,
  COMMITTEE_DEFAULTS,
  type CommitteeCreateValues,
} from '../CreateUser.validators';

const USERS_LIST_ROUTE = '/admin/administrador/usuarios';
const FALLBACK_MESSAGE = 'Não foi possível cadastrar o membro do comitê. Tente novamente.';

export function CommitteeCreateForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectUsersMutationLoading);
  const apiError = useAppSelector(selectUsersMutationError);
  const specialties = useAppSelector(selectSpecialtiesList);
  const specialtiesLoading = useAppSelector(selectSpecialtiesListLoading);
  const specialtiesError = useAppSelector(selectSpecialtiesListError);

  const form = useForm({
    schema: committeeSchema,
    defaultValues: COMMITTEE_DEFAULTS,
  });
  const { control, handleSubmit, reset, applyApiFieldErrors, fieldError } = form;

  const fullName = useController({ control, name: 'fullName' });
  const email = useController({ control, name: 'email' });
  const password = useController({ control, name: 'password' });
  const passwordConfirmation = useController({ control, name: 'passwordConfirmation' });
  const specialtyId = useController({ control, name: 'specialtyId' });

  useEffect(() => {
    dispatch(fetchSpecialties({ isActive: true }));
  }, [dispatch]);

  useEffect(() => {
    if (apiError) applyApiFieldErrors(apiError);
  }, [apiError, applyApiFieldErrors]);

  useEffect(() => () => { dispatch(clearUsersMutationError()); }, [dispatch]);

  async function submit(values: CommitteeCreateValues) {
    if (!values.specialtyId) return;
    const result = await dispatch(createCommitteeMember({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      specialtyId: Number(values.specialtyId.value),
    }));

    if (createCommitteeMember.fulfilled.match(result)) {
      reset(COMMITTEE_DEFAULTS);
      navigate(USERS_LIST_ROUTE);
    }
  }

  const specialtyOptions = useMemo(
    () => specialties.map((s) => ({ label: s.name, value: String(s.id) })),
    [specialties],
  );

  const sharedFields: SharedUserFormFields = {
    fullName: textFieldProps(fullName.field, fieldError('fullName')),
    email: textFieldProps(email.field, fieldError('email')),
    password: textFieldProps(password.field, fieldError('password')),
    passwordConfirmation: textFieldProps(passwordConfirmation.field, fieldError('passwordConfirmation')),
  };

  const committeeFields: CommitteeProfileFormFields = {
    specialtyId: {
      name: 'specialtyId',
      value: specialtyId.field.value,
      options: specialtyOptions,
      onChange: specialtyId.field.onChange,
      onBlur: specialtyId.field.onBlur,
      loading: specialtiesLoading,
    },
  };

  const errorSnackbar = useApiError(
    apiError,
    () => dispatch(clearUsersMutationError()),
    FALLBACK_MESSAGE,
  );

  return (
    <div className="create-user-form">
      <SharedUserForm fields={sharedFields} />
      <CommitteeProfileForm fields={committeeFields} />
      {specialtiesError ? (
        <p className="create-user-form__error" role="alert">
          Não foi possível carregar as especialidades. {specialtiesError.message}
        </p>
      ) : null}
      <div className="create-user-form__actions">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate(USERS_LIST_ROUTE)}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isLoading}
          onClick={() => { void handleSubmit(submit)(); }}
        >
          {isLoading ? 'Cadastrando…' : 'Cadastrar'}
        </Button>
      </div>
      <Snackbar {...errorSnackbar} />
    </div>
  );
}
