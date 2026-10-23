import { useController } from 'react-hook-form';
import { useMemo } from 'react';
import type { z } from 'zod';
import { useForm } from '../use-form/use-form';
import type { UserRole } from '../../../types/user.types';

const USER_DEFAULTS = {
  role: '',
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
  coepDocument: undefined,
  specialtyId: null,
};

type UseSharedUserFormOptions = {
  schema: z.ZodTypeAny;
  initialRole?: UserRole | '';
};

/** Centraliza os controllers compartilhados dos cadastros de usuários. */
export function useSharedUserForm({ schema, initialRole = '' }: UseSharedUserFormOptions) {
  const defaultValues = useMemo(
    () => ({ ...USER_DEFAULTS, role: initialRole }),
    [initialRole],
  );
  const form = useForm({
    schema,
    defaultValues,
  });
  const { control } = form;

  const fields = {
    fullName: useController({ control, name: 'fullName' }),
    email: useController({ control, name: 'email' }),
    password: useController({ control, name: 'password' }),
    passwordConfirmation: useController({ control, name: 'passwordConfirmation' }),
  };

  return { ...form, fields };
}
