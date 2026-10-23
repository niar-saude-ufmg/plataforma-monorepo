import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useController } from 'react-hook-form';
import { Button, Snackbar } from '@niar/ui';
import { useForm } from '../../../hooks/forms/use-form/use-form';
import { textFieldProps } from '../../../hooks/forms/utils/props';
import { useApiError } from '../../../hooks/use-api-error/use-api-error';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createAdministrator } from '../../../store/users/users.api';
import { clearUsersMutationError } from '../../../store/users/users.slice';
import {
  selectUsersMutationError,
  selectUsersMutationLoading,
} from '../../../store/users/users.selectors';
import type { SharedUserFormFields } from '../../../types/user.types';
import { SharedUserForm } from '../../../components/UserForm/SharedUserForm/SharedUserForm';
import {
  administratorSchema,
  ADMIN_DEFAULTS,
  type AdministratorCreateValues,
} from '../CreateUser.validators';

const USERS_LIST_ROUTE = '/admin/administrador/usuarios';
const FALLBACK_MESSAGE = 'Não foi possível cadastrar o administrador. Tente novamente.';

export function AdministratorCreateForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectUsersMutationLoading);
  const apiError = useAppSelector(selectUsersMutationError);

  const form = useForm({
    schema: administratorSchema,
    defaultValues: ADMIN_DEFAULTS,
  });
  const { control, handleSubmit, reset, applyApiFieldErrors, fieldError } = form;

  const fullName = useController({ control, name: 'fullName' });
  const email = useController({ control, name: 'email' });
  const password = useController({ control, name: 'password' });
  const passwordConfirmation = useController({ control, name: 'passwordConfirmation' });

  useEffect(() => {
    if (apiError) applyApiFieldErrors(apiError);
  }, [apiError, applyApiFieldErrors]);

  useEffect(() => () => { dispatch(clearUsersMutationError()); }, [dispatch]);

  async function submit(values: AdministratorCreateValues) {
    const result = await dispatch(createAdministrator({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
    }));

    if (createAdministrator.fulfilled.match(result)) {
      reset(ADMIN_DEFAULTS);
      navigate(USERS_LIST_ROUTE);
    }
  }

  const fields: SharedUserFormFields = {
    fullName: textFieldProps(fullName.field, fieldError('fullName')),
    email: textFieldProps(email.field, fieldError('email')),
    password: textFieldProps(password.field, fieldError('password')),
    passwordConfirmation: textFieldProps(passwordConfirmation.field, fieldError('passwordConfirmation')),
  };

  const errorSnackbar = useApiError(
    apiError,
    () => dispatch(clearUsersMutationError()),
    FALLBACK_MESSAGE,
  );

  return (
    <div className="create-user-form">
      <SharedUserForm fields={fields} />
      <p className="create-user-form__profile-helper">
        Este perfil terá acesso administrativo à plataforma.
      </p>
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
