import { useController } from 'react-hook-form';
import type { UserTextField } from '../../../types/user.types';
import { useForm } from '../use-form/use-form';
import { textFieldProps } from '../utils/props';
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from './use-change-password-form.validators';

export type { ChangePasswordFormValues } from './use-change-password-form.validators';

export type ChangePasswordSubmitValues = Pick<
  ChangePasswordFormValues,
  'currentPassword' | 'password'
>;

export type ChangePasswordFormFields = {
  currentPassword: UserTextField;
  password: UserTextField;
  passwordConfirmation: UserTextField;
};

const EMPTY_VALUES: ChangePasswordFormValues = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
};

export function useChangePasswordForm() {
  const form = useForm<ChangePasswordFormValues>({
    schema: changePasswordFormSchema,
    defaultValues: EMPTY_VALUES,
  });
  const { control, fieldError } = form;

  const fields: ChangePasswordFormFields = {
    currentPassword: textFieldProps(
      useController({ control, name: 'currentPassword' }).field,
      fieldError('currentPassword'),
    ),
    password: textFieldProps(
      useController({ control, name: 'password' }).field,
      fieldError('password'),
    ),
    passwordConfirmation: textFieldProps(
      useController({ control, name: 'passwordConfirmation' }).field,
      fieldError('passwordConfirmation'),
    ),
  };

  return { ...form, fields };
}
