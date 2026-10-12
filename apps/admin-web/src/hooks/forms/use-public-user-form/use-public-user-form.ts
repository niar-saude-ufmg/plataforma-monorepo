import { useController } from 'react-hook-form';
import { useForm } from '../use-form/use-form';
import {
  researcherRegistrationSchema,
  type ResearcherRegistrationValues,
} from '../../../pages/PublicUser/PublicUser.validators';

export const DEFAULT_PUBLIC_USER_VALUES: ResearcherRegistrationValues = {
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

/** Centraliza os controllers do cadastro público para reutilização pela página. */
export function usePublicUserForm() {
  const form = useForm({
    schema: researcherRegistrationSchema,
    defaultValues: DEFAULT_PUBLIC_USER_VALUES,
  });
  const { control } = form;

  const fields = {
    fullName: useController({ control, name: 'fullName' }),
    email: useController({ control, name: 'email' }),
    password: useController({ control, name: 'password' }),
    passwordConfirmation: useController({ control, name: 'passwordConfirmation' }),
    phone: useController({ control, name: 'phone' }),
    institution: useController({ control, name: 'institution' }),
    organizationalUnit: useController({ control, name: 'organizationalUnit' }),
    contactAddress: useController({ control, name: 'contactAddress' }),
    researchArea: useController({ control, name: 'researchArea' }),
    position: useController({ control, name: 'position' }),
    caae: useController({ control, name: 'caae' }),
    opinionNumber: useController({ control, name: 'opinionNumber' }),
    approvalDate: useController({ control, name: 'approvalDate' }),
    coepDocument: useController({ control, name: 'coepDocument' }),
  };

  return { ...form, fields };
}
