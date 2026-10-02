import { APP_ROUTES } from '@niar/config';
import { USER_ROLE_LABELS, type UserRole } from '@niar/contracts';
import { Alert, Button, Card, Form, Icon, Link, PageIntro, StatusChip } from '@niar/ui';
import { useState } from 'react';
import { useController, type ControllerRenderProps } from 'react-hook-form';
import { useNiarForm } from '../../hooks/forms/use-niar-form';
import { useCreateUserMutation } from '../../store/users/users.api';
import type {
  ApiError,
  CoepUserFormFields,
  CreateUserInput,
  ResearcherProfileFormFields,
  SharedUserFormFields,
  User,
  UserTextField,
} from '../../types/user.types';
import { CoepUserForm } from '../../components/UserForm/CoepUserForm/CoepUserForm';
import { ResearcherProfileForm } from '../../components/UserForm/ResearcherProfileForm/ResearcherProfileForm';
import { SharedUserForm } from '../../components/UserForm/SharedUserForm/SharedUserForm';
import { RegistrationApprovalDialog } from '../../components/RegistrationApprovalDialog/RegistrationApprovalDialog';
import './PublicUser.scss';
import {
  researcherRegistrationSchema,
  type ResearcherRegistrationValues,
} from './PublicUser.validators';
import { formatBrazilianPhone } from './PublicUser.formatters';

type UsersPageProps = {
  mode?: 'admin' | 'public';
  currentUser?: {
    name: string;
    email: string;
    role: UserRole;
  };
};

const DEFAULT_VALUES: ResearcherRegistrationValues = {
  fullName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  phone: '',
  institution: '',
  organizationalUnit: '',
  contactAddress: '',
  researchArea: '',
  position: '',
  caae: '',
  opinionNumber: '',
  approvalDate: '',
  coepDocument: undefined as unknown as File,
};

function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'message' in value;
}

function textFieldProps<TName extends keyof ResearcherRegistrationValues>(
  field: ControllerRenderProps<ResearcherRegistrationValues, TName>,
  error?: string,
  formatValue?: (value: string) => string,
): UserTextField {
  return {
    name: field.name,
    value: String(field.value ?? ''),
    onChange: formatValue
      ? (event) => field.onChange(formatValue(event.target.value))
      : field.onChange,
    onBlur: field.onBlur,
    error: Boolean(error),
    helperText: error,
  };
}

function RegistrationForm({ onCreated }: { onCreated?: (user: User) => void }) {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useNiarForm({
    schema: researcherRegistrationSchema,
    defaultValues: DEFAULT_VALUES,
  });

  const fullName = useController({ control, name: 'fullName' });
  const email = useController({ control, name: 'email' });
  const password = useController({ control, name: 'password' });
  const passwordConfirmation = useController({ control, name: 'passwordConfirmation' });
  const phone = useController({ control, name: 'phone' });
  const institution = useController({ control, name: 'institution' });
  const organizationalUnit = useController({ control, name: 'organizationalUnit' });
  const contactAddress = useController({ control, name: 'contactAddress' });
  const researchArea = useController({ control, name: 'researchArea' });
  const position = useController({ control, name: 'position' });
  const caae = useController({ control, name: 'caae' });
  const opinionNumber = useController({ control, name: 'opinionNumber' });
  const approvalDate = useController({ control, name: 'approvalDate' });
  const coepDocument = useController({ control, name: 'coepDocument' });

  const fieldMessage = (field: keyof ResearcherRegistrationValues) => {
    const message = errors[field]?.message;
    return typeof message === 'string' ? message : undefined;
  };

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

    try {
      const created = await createUser(input).unwrap();
      reset(DEFAULT_VALUES);
      onCreated?.(created);
    } catch (error) {
      if (isApiError(error)) {
        Object.entries(error.fieldErrors ?? {}).forEach(([field, message]) => {
          if (message && field in DEFAULT_VALUES) {
            setError(field as keyof ResearcherRegistrationValues, { message });
          }
        });
        setError('root', { message: error.message });
        return;
      }

      setError('root', { message: 'Não foi possível cadastrar o pesquisador. Tente novamente.' });
    }
  }

  const sharedFields: SharedUserFormFields = {
    fullName: textFieldProps(fullName.field, fieldMessage('fullName')),
    email: textFieldProps(email.field, fieldMessage('email')),
    password: textFieldProps(password.field, fieldMessage('password')),
    passwordConfirmation: textFieldProps(passwordConfirmation.field, fieldMessage('passwordConfirmation')),
  };

  const researcherFields: ResearcherProfileFormFields = {
    phone: textFieldProps(phone.field, fieldMessage('phone'), formatBrazilianPhone),
    institution: textFieldProps(institution.field, fieldMessage('institution')),
    organizationalUnit: textFieldProps(organizationalUnit.field, fieldMessage('organizationalUnit')),
    contactAddress: textFieldProps(contactAddress.field, fieldMessage('contactAddress')),
    researchArea: textFieldProps(researchArea.field, fieldMessage('researchArea')),
    position: textFieldProps(position.field, fieldMessage('position')),
  };

  const coepFields: CoepUserFormFields = {
    caae: textFieldProps(caae.field, fieldMessage('caae')),
    opinionNumber: textFieldProps(opinionNumber.field, fieldMessage('opinionNumber')),
    approvalDate: textFieldProps(approvalDate.field, fieldMessage('approvalDate')),
    coepDocument: {
      onChange: (file) => coepDocument.field.onChange(file),
      error: fieldMessage('coepDocument'),
    },
  };

  const rootError = typeof errors.root?.message === 'string' ? errors.root.message : undefined;

  return (
    <div className="public-user-form">
      {rootError ? <Alert severity="error">{rootError}</Alert> : null}
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
 * Página pública de cadastro e resumo da sessão do usuário.
 * A página compõe os formulários dumb e concentra estado, validação e API.
 */
export function PublicUser({ mode = 'admin', currentUser }: UsersPageProps) {
  const isPublicMode = mode === 'public';
  const [isApprovalDialogOpen, setApprovalDialogOpen] = useState(false);

  function handleCreated() {
    if (!isPublicMode) {
      return;
    }

    setApprovalDialogOpen(true);
  }

  function handleApprovalDialogClose() {
    setApprovalDialogOpen(false);
    window.location.assign(APP_ROUTES.salaSegura);
  }

  if (!isPublicMode && currentUser) {
    return (
      <div className="users-page">
        <header className="page-head">
          <PageIntro
            title="Gerenciamento do usuário"
            description="Consulte os dados da sua conta e acesse, nas próximas etapas, as funções disponíveis para o seu perfil."
          />
        </header>

        <Card variant="outlined">
          <div className="card-section-heading">
            <h2 id="current-user-title">Usuário autenticado</h2>
            <p>Estas são as informações da sessão atual.</p>
          </div>
          <dl className="user-summary">
            <div className="user-summary__item">
              <dt>Nome</dt>
              <dd>{currentUser.name}</dd>
            </div>
            <div className="user-summary__item">
              <dt>E-mail</dt>
              <dd>{currentUser.email}</dd>
            </div>
            <div className="user-summary__item">
              <dt>Tipo de usuário</dt>
              <dd><StatusChip status="info" label={USER_ROLE_LABELS[currentUser.role]} /></dd>
            </div>
          </dl>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className={isPublicMode ? 'users-page users-page--public' : 'users-page'}>
        {isPublicMode ? (
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
        ) : null}

        <Form
          title="Cadastro de pesquisador"
          description="Preencha os dados abaixo para criar o acesso e registrar o parecer do COEP."
          aria-level={1}
        >
          <div className="form-card-body">
            <RegistrationForm onCreated={handleCreated} />
          </div>
        </Form>
      </div>
      <RegistrationApprovalDialog
        open={isApprovalDialogOpen}
        onClose={handleApprovalDialogClose}
      />
    </>
  );
}
