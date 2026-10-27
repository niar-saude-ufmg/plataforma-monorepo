import { z } from 'zod';

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Informe a senha atual.' }),
    password: z.string().min(8, { message: 'A nova senha precisa ter pelo menos 8 caracteres.' }),
    passwordConfirmation: z.string().min(1, { message: 'Repita a nova senha.' }),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'As senhas não conferem.',
    path: ['passwordConfirmation'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
