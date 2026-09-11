import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { forwardRef } from 'react';

export type SelectProps = Omit<TextFieldProps<'outlined'>,
  'variant' | 'size' | 'type' | 'select' | 'multiline' | 'rows' | 'minRows' | 'maxRows' | 'slots' | 'slotProps' | 'children'
> & {
  options: readonly { value: string; label: string; disabled?: boolean }[];
};

export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(
  { options, ...props }, ref,
) {
  return (
    <TextField {...props} ref={ref} select variant="outlined" size="medium"
      slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}>
      {options.map(({ value, label, disabled }) => (
        <option key={value} value={value} disabled={disabled}>{label}</option>
      ))}
    </TextField>
  );
});
