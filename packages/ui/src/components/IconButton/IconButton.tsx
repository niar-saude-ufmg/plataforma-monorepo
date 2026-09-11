import MuiIconButton, { type IconButtonProps as MuiIconButtonProps } from '@mui/material/IconButton';
import { forwardRef } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
export type IconButtonProps = Omit<MuiIconButtonProps, 'children'> & { name: IconName };
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ name, 'aria-label': ariaLabel, ...props }, ref) { return <MuiIconButton ref={ref} aria-label={ariaLabel ?? name} {...props}><Icon name={name} /></MuiIconButton>; });
