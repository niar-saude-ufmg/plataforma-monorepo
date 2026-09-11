import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { forwardRef } from 'react';

export type ButtonProps = Omit<MuiButtonProps, 'color'> & {
  color?: 'primary' | 'secondary';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  return <MuiButton ref={ref} {...props} />;
});
