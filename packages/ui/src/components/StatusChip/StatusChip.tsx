import Chip, { type ChipProps } from '@mui/material/Chip';
import { forwardRef } from 'react';

export type StatusChipStatus = 'default' | 'info' | 'success' | 'warning' | 'error';
export type StatusChipProps = Omit<ChipProps, 'color'> & { status?: StatusChipStatus };

export const StatusChip = forwardRef<HTMLDivElement, StatusChipProps>(function StatusChip({ status = 'default', ...props }, ref) {
  return <Chip ref={ref} color={status === 'default' ? 'default' : status} {...props} />;
});
