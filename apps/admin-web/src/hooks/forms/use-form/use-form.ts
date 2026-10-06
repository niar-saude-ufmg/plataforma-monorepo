import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import {
  useForm as useReactHookForm,
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

type FormApiError = {
  message: string;
  fieldErrors?: Record<string, string>;
};

function getApiErrorPayload(error: unknown): FormApiError | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  if ('data' in error && typeof error.data === 'object' && error.data !== null) {
    return getApiErrorPayload(error.data);
  }

  if ('message' in error && typeof error.message === 'string') {
    return error as FormApiError;
  }

  return undefined;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  return getApiErrorPayload(error)?.message ?? fallbackMessage;
}

type UseFormOptions<TFieldValues extends FieldValues> = {
  schema: z.ZodType<TFieldValues>;
  defaultValues: DefaultValues<TFieldValues>;
  mode?: UseFormProps<TFieldValues>['mode'];
};

/** Configura a infraestrutura comum dos formulários orientados por Zod. */
export function useForm<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onBlur',
}: UseFormOptions<TFieldValues>): UseFormReturn<TFieldValues> & {
  fieldError: (field: FieldPath<TFieldValues>) => string | undefined;
  applyApiFieldErrors: (error: unknown) => void;
} {
  const form = useReactHookForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  });
  const { setError } = form;

  const fieldError = (field: FieldPath<TFieldValues>) => {
    const message = form.formState.errors[field]?.message;
    return typeof message === 'string' ? message : undefined;
  };

  const applyApiFieldErrors = useCallback((error: unknown) => {
    const apiError = getApiErrorPayload(error);

    Object.entries(apiError?.fieldErrors ?? {}).forEach(([field, message]) => {
      if (message && field in defaultValues) {
        setError(field as FieldPath<TFieldValues>, { message });
      }
    });
  }, [defaultValues, setError]);

  return { ...form, fieldError, applyApiFieldErrors };
}
