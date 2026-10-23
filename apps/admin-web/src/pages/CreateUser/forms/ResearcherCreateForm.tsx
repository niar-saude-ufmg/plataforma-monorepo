import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useController } from 'react-hook-form';
import { Button, Snackbar } from '@niar/ui';
import { useForm } from '../../../hooks/forms/use-form/use-form';
import { textFieldProps } from '../../../hooks/forms/utils/props';
import { useApiError } from '../../../hooks/use-api-error/use-api-error';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createResearcher } from '../../../store/users/users.api';
import { clearUsersMutationError } from '../../../store/users/users.slice';
import {
  selectUsersMutationError,
  selectUsersMutationLoading,
} from '../../../store/users/users.selectors';
import type {
  CoepUserFormFields,
  ResearcherProfileFormFields,
  SharedUserFormFields,
} from '../../../types/user.types';
import { SharedUserForm } from '../../../components/UserForm/SharedUserForm/SharedUserForm';
import { ResearcherProfileForm } from '../../../components/UserForm/ResearcherProfileForm/ResearcherProfileForm';
import { CoepUserForm } from '../../../components/UserForm/CoepUserForm/CoepUserForm';
import { formatBrazilianPhone } from '../../PublicUser/PublicUser.formatters';
import {
  researcherSchema,
  RESEARCHER_DEFAULTS,
  type ResearcherCreateValues,
} from '../CreateUser.validators';

const USERS_LIST_ROUTE = '/admin/administrador/usuarios';
const FALLBACK_MESSAGE = 'Não foi possível cadastrar o pesquisador. Tente novamente.';

export function ResearcherCreateForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectUsersMutationLoading);
  const apiError = useAppSelector(selectUsersMutationError);

  const form = useForm({
    schema: researcherSchema,
    defaultValues: RESEARCHER_DEFAULTS,
  });
  const { control, handleSubmit, reset, applyApiFieldErrors, fieldError } = form;

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

  useEffect(() => {
    if (apiError) applyApiFieldErrors(apiError);
  }, [apiError, applyApiFieldErrors]);

  useEffect(() => () => { dispatch(clearUsersMutationError()); }, [dispatch]);

  async function submit(values: ResearcherCreateValues) {
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
        document: values.coepDocument,
      },
    }));

    if (createResearcher.fulfilled.match(result)) {
      reset(RESEARCHER_DEFAULTS);
      navigate(USERS_LIST_ROUTE);
    }
  }

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

  const errorSnackbar = useApiError(
    apiError,
    () => dispatch(clearUsersMutationError()),
    FALLBACK_MESSAGE,
  );

  return (
    <div className="create-user-form">
      <SharedUserForm fields={sharedFields} />
      <ResearcherProfileForm fields={researcherFields} />
      <CoepUserForm fields={coepFields} />
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
