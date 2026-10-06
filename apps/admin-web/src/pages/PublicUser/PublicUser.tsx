import { APP_ROUTES } from '@niar/config';
import { Button, Form, Icon, Link, Snackbar } from '@niar/ui';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../hooks/forms/use-form/use-form';
import { usePublicUserForm, DEFAULT_PUBLIC_USER_VALUES } from '../../hooks/forms/use-public-user-form/use-public-user-form';
import { textFieldProps } from '../../hooks/forms/utils/props';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createUser } from '../../store/users/users.api';
import {
  clearUsersError,
  selectError,
  selectIsLoading,
} from '../../store/users/users.slice';
import type {
  ApiError,
  CoepUserFormFields,
  CreateUserInput,
  ResearcherProfileFormFields,
  SharedUserFormFields,
  User,
} from '../../types/user.types';
import { CoepUserForm } from '../../components/UserForm/CoepUserForm/CoepUserForm';
import { ResearcherProfileForm } from '../../components/UserForm/ResearcherProfileForm/ResearcherProfileForm';
import { SharedUserForm } from '../../components/UserForm/SharedUserForm/SharedUserForm';
import { RegistrationApprovalDialog } from '../../components/RegistrationApprovalDialog/RegistrationApprovalDialog';
import './PublicUser.scss';
import {
  type ResearcherRegistrationValues,
} from './PublicUser.validators';
import { formatBrazilianPhone } from './PublicUser.formatters';

function RegistrationForm({
  apiError,
  onCreated,
}: {
  apiError: ApiError | null;
  onCreated?: (user: User) => void;
}) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const {
    handleSubmit,
    reset,
    clearErrors,
    applyApiFieldErrors,
    fieldError,
    formState: { errors },
    fields,
  } = usePublicUserForm();

  useEffect(() => {
    if (apiError) {
      applyApiFieldErrors(apiError);
    }
  }, [apiError, applyApiFieldErrors]);

  async function submit(values: ResearcherRegistrationValues) {
    const input: CreateUserInput = {
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
        document: values.coepDocument,
      },
    };

    const result = await dispatch(createUser(input));

    if (createUser.fulfilled.match(result)) {
      reset(DEFAULT_PUBLIC_USER_VALUES);
      onCreated?.(result.payload);
    }
  }

  const sharedFields: SharedUserFormFields = {
    fullName: textFieldProps(fields.fullName.field, fieldError('fullName')),
    email: textFieldProps(fields.email.field, fieldError('email')),
    password: textFieldProps(fields.password.field, fieldError('password')),
    passwordConfirmation: textFieldProps(fields.passwordConfirmation.field, fieldError('passwordConfirmation')),
  };

  const researcherFields: ResearcherProfileFormFields = {
    phone: textFieldProps(fields.phone.field, fieldError('phone'), formatBrazilianPhone),
    institution: textFieldProps(fields.institution.field, fieldError('institution')),
    organizationalUnit: textFieldProps(fields.organizationalUnit.field, fieldError('organizationalUnit')),
    contactAddress: textFieldProps(fields.contactAddress.field, fieldError('contactAddress')),
    researchArea: textFieldProps(fields.researchArea.field, fieldError('researchArea')),
    position: textFieldProps(fields.position.field, fieldError('position')),
  };

  const coepFields: CoepUserFormFields = {
    caae: textFieldProps(fields.caae.field, fieldError('caae')),
    opinionNumber: textFieldProps(fields.opinionNumber.field, fieldError('opinionNumber')),
    approvalDate: textFieldProps(fields.approvalDate.field, fieldError('approvalDate')),
    coepDocument: {
      onChange: (file) => fields.coepDocument.field.onChange(file),
      error: fieldError('coepDocument'),
    },
  };

  const formError = typeof errors.root?.message === 'string' ? errors.root.message : undefined;

  return (
    <div className="public-user-form">
      <Snackbar
        open={Boolean(formError)}
        message={formError ?? ''}
        severity="error"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => clearErrors('root')}
      />
      <SharedUserForm fields={sharedFields} />
      <ResearcherProfileForm fields={researcherFields} />
      <CoepUserForm fields={coepFields} />
      <div className="public-user-form__actions">
        <Button
          href={APP_ROUTES.salaSegura}
          variant="outlined"
          color="primary"
        >
          Cancelar
        </Button>
        <Button
          onClick={() => { void handleSubmit(submit)(); }}
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Cadastrando…' : 'Cadastrar'}
        </Button>
      </div>
    </div>
  );
}

/*
 * Página pública de cadastro de pesquisador.
 * A página compõe os formulários dumb e concentra estado, validação e API.
 */
export function PublicUser() {
  const [isApprovalDialogOpen, setApprovalDialogOpen] = useState(false);
  const dispatch = useAppDispatch();
  const apiError = useAppSelector(selectError);
  const apiErrorMessage = apiError
    ? getApiErrorMessage(apiError, 'Não foi possível cadastrar o pesquisador. Tente novamente.')
    : '';

  function handleCreated() {
    setApprovalDialogOpen(true);
  }

  function handleApprovalDialogClose() {
    setApprovalDialogOpen(false);
    window.location.assign(APP_ROUTES.salaSegura);
  }

  return (
    <>
      <div className="users-page users-page--public">
        <div className="public-user-back">
          <Link
            className="public-user-back__link"
            href={APP_ROUTES.salaSegura}
            startIcon={<Icon name="arrowBack" fontSize="small" aria-hidden="true" />}
            underline="none"
          >
            Voltar para a Sala Segura
          </Link>
        </div>

        <Form
          title="Cadastro de pesquisador"
          description="Preencha os dados abaixo para criar o acesso e registrar o parecer do COEP."
          aria-level={1}
        >
          <div className="form-card-body">
            <RegistrationForm apiError={apiError} onCreated={handleCreated} />
          </div>
        </Form>
      </div>
      <Snackbar
        open={Boolean(apiErrorMessage)}
        message={apiErrorMessage}
        severity="error"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => dispatch(clearUsersError())}
      />
      <RegistrationApprovalDialog
        open={isApprovalDialogOpen}
        onClose={handleApprovalDialogClose}
      />
    </>
  );
}
