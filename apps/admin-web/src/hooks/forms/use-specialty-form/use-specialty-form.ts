import { useEffect } from 'react';
import { useController } from 'react-hook-form';
import { useForm } from '../use-form/use-form';
import type { Specialty } from '../../../types/specialty.types';
import {
  specialtySchema,
  type SpecialtyFormValues,
} from './use-specialty-form.validators';

export type { SpecialtyFormValues } from './use-specialty-form.validators';

const EMPTY_VALUES: SpecialtyFormValues = {
  code: '',
  name: '',
  description: '',
  guidanceContext: '',
};

type UseSpecialtyFormOptions = {
  mode: 'create' | 'edit';
  initialValues?: Specialty;
};

export function useSpecialtyForm({ mode, initialValues }: UseSpecialtyFormOptions) {
  const form = useForm({ schema: specialtySchema, defaultValues: EMPTY_VALUES });
  const { control, reset } = form;

  const fields = {
    code: useController({ control, name: 'code' }),
    name: useController({ control, name: 'name' }),
    description: useController({ control, name: 'description' }),
    guidanceContext: useController({ control, name: 'guidanceContext' }),
  };

  useEffect(() => {
    reset(mode === 'edit' && initialValues ? {
      code: initialValues.code,
      name: initialValues.name,
      description: initialValues.description,
      guidanceContext: initialValues.guidanceContext,
    } : EMPTY_VALUES);
  }, [mode, initialValues, reset]);

  return { ...form, fields };
}

export type SpecialtyFormFields = ReturnType<typeof useSpecialtyForm>['fields'];
