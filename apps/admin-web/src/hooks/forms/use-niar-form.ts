import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

type UseNiarFormOptions<TFieldValues extends FieldValues> = {
  schema: z.ZodType<TFieldValues>;
  defaultValues: DefaultValues<TFieldValues>;
  mode?: UseFormProps<TFieldValues>['mode'];
};

/** Configura a infraestrutura comum dos formulários orientados por Zod. */
export function useNiarForm<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onBlur',
}: UseNiarFormOptions<TFieldValues>): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  });
}
