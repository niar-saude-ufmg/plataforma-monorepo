import { useEffect, useMemo } from 'react';
import { useController } from 'react-hook-form';
import { z } from 'zod';
import type { AuthUser, UserTextField } from '../../../types/user.types';
import type { ProfileFieldId } from '../../../types/role-profile';
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
  editableFields: readonly ProfileFieldId[];
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

export function useProfileForm({ user, editableFields }: UseProfileFormOptions) {
  const defaultValues = useMemo(() => toFormValues(user), [user]);
  const schema = useMemo(
    () => editableFields.includes('phone')
      ? profileFormSchema
      : profileFormSchema.extend({ phone: z.string().trim().optional() }),
    [editableFields],
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
    showPhone: editableFields.includes('phone'),
  };
}
