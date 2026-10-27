import { useEffect, useMemo } from 'react';
import { useController } from 'react-hook-form';
import { z } from 'zod';
import type { AuthUser, UserTextField } from '../../../types/user.types';
import type { ProfileRoleConfig } from '../../../types/role-profile';
import { useForm } from '../use-form/use-form';
import { textFieldProps } from '../utils/props';
import { profileFormSchema, type ProfileFormValues } from './use-profile-form.validators';

export type { ProfileFormValues } from './use-profile-form.validators';

export type ProfileFormFields = {
  fullName: UserTextField;
  email: UserTextField;
  phone: UserTextField;
};

type UseProfileFormOptions = {
  user: AuthUser | null;
  fields: ProfileRoleConfig['fields'];
};

const EMPTY_VALUES: ProfileFormValues = {
  fullName: '',
  email: '',
  phone: '',
};

const toFormValues = (user: AuthUser | null): ProfileFormValues =>
  user
    ? {
        fullName: user.name,
        email: user.email,
        phone: user.profile?.phone ?? '',
      }
    : EMPTY_VALUES;

export function useProfileForm({ user, fields: fieldConfig }: UseProfileFormOptions) {
  const defaultValues = useMemo(() => toFormValues(user), [user]);
  const schema = useMemo(
    () => fieldConfig.phone.editable
      ? profileFormSchema
      : profileFormSchema.extend({ phone: z.string().trim().optional() }),
    [fieldConfig.phone.editable],
  );
  const form = useForm<ProfileFormValues>({
    schema,
    defaultValues,
  });
  const { control, reset, fieldError } = form;

  const fields: ProfileFormFields = {
    fullName: textFieldProps(
      useController({ control, name: 'fullName' }).field,
      fieldError('fullName'),
    ),
    email: textFieldProps(
      useController({ control, name: 'email' }).field,
      fieldError('email'),
    ),
    phone: textFieldProps(
      useController({ control, name: 'phone' }).field,
      fieldError('phone'),
    ),
  };

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return {
    ...form,
    fields,
  };
}
