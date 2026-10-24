import { z } from 'zod';
import type { CommitteeSpecialtyOption } from '../../../types/user.types';

const committeeSpecialtySchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const committeeProfileSchema = z.object({
  specialtyId: committeeSpecialtySchema
    .nullable()
    .refine(
      (value): value is CommitteeSpecialtyOption => value !== null,
      { message: 'Selecione uma especialidade.' },
    ),
});
