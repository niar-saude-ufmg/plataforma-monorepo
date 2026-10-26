import { APP_ROUTES } from '@niar/config';
import type { UserRole } from '@niar/contracts';
import { Button, Form, Icon, Link, Snackbar } from '@niar/ui';
import { useEffect, useState } from 'react';
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import { useResearcherForm } from '../../hooks/forms/use-researcher-form/use-researcher-form';
import { useSharedUserForm } from '../../hooks/forms/use-shared-user-form/use-shared-user-form';
import { textFieldProps } from '../../hooks/forms/utils/props';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createUser } from '../../store/users/users.api';
import { clearUsersMutationError } from '../../store/users/users.slice';
import { selectUsersMutationError, selectUsersMutationLoading } from '../../store/users/users.selectors';
import type {
  UserApiError,
  CoepUserFormFields,
  CreateUserInput,
  ResearcherProfileFormFields,
  SharedUserFormFields,
  User,
} from '../../types/user.types';
import { CoepUserForm } from '../../components/UserForm/CoepUserForm/CoepUserForm';
import { ResearcherProfileForm } from '../../components/UserForm/ResearcherProfileForm/ResearcherProfileForm';
import { SharedUserForm } from '../../components/UserForm/SharedUserForm/SharedUserForm';
import { RegistrationApprovalDialog } from '../../components/RegistrationApprovalDialog';
import './PublicUser.scss';
import { formatBrazilianPhone } from '../../utils/formatters/phone';
import { researcherRegistrationSchema } from './PublicUser.validators';

const PUBLIC_USER_ROLE: UserRole = 'researcher';

function RegistrationForm({
  apiError,
  onCreated,
}: {
  apiError: UserApiError | null;
  onCreated?: (user: User) => void;
}) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectUsersMutationLoading);
  const form = useSharedUserForm({ schema: researcherRegistrationSchema, initialRole: PUBLIC_USER_ROLE });
  const {
    handleSubmit,
    reset,
    applyApiFieldErrors,
    fieldError,
    fields,
  } = form;
  const { fields: researcherFormFields } = useResearcherForm(form.control);
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

  useEffect(() => {
    if (apiError) {
      applyApiFieldErrors(apiError);
    }
  }, [apiError, applyApiFieldErrors]);

  const submit = handleSubmit(async (values) => {
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
        document: values.coepDocument as File,
      },
    };

    const result = await dispatch(createUser(input));

    if (createUser.fulfilled.match(result)) {
      reset();
      onCreated?.(result.payload);
    }
  });

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

  return (
    <div className="public-user-form">
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
          onClick={() => { void submit(); }}
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
  const apiError = useAppSelector(selectUsersMutationError);
  const apiErrorSnackbar = useApiError(
    apiError,
    () => dispatch(clearUsersMutationError()),
    'Não foi possível cadastrar o pesquisador. Tente novamente.',
  );

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
      <Snackbar {...apiErrorSnackbar} />
      <RegistrationApprovalDialog
        open={isApprovalDialogOpen}
        onClose={handleApprovalDialogClose}
      />
    </>
  );
}
