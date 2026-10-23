import { z } from 'zod';

export const specialtySchema = z.object({
  code: z.string().trim().min(1, 'Informe o código.').max(100, 'Use até 100 caracteres.'),
  name: z.string().trim().min(1, 'Informe o nome.').max(255, 'Use até 255 caracteres.'),
  description: z.string().max(2000, 'Use até 2000 caracteres.'),
  guidanceContext: z.string().max(4000, 'Use até 4000 caracteres.'),
});

export type SpecialtyFormValues = z.infer<typeof specialtySchema>;
