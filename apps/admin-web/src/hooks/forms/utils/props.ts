import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import type { UserTextField } from '../../../types/user.types';

type TextFieldFormatter = (value: string) => string;

/**
 * Adapta um campo controlado pelo React Hook Form ao contrato dos Inputs do admin.
 * Pode ser reutilizado por qualquer página que componha os formulários dumb.
 */
export function textFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  field: ControllerRenderProps<TFieldValues, TName>,
  error?: string,
  formatValue?: TextFieldFormatter,
): UserTextField {
  return {
    name: field.name,
    value: String(field.value ?? ''),
    onChange: (event) => {
      const value = event.target.value;
      field.onChange(formatValue ? formatValue(value) : value);
    },
    onBlur: field.onBlur,
    error: Boolean(error),
    helperText: error,
  };
}
