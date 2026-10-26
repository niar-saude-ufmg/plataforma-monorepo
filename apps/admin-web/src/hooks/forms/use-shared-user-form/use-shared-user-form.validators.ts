import { z } from 'zod';

export const sharedUserFields = {
  fullName: z.string().trim().min(1, 'Informe o nome completo.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
  passwordConfirmation: z.string().min(1, 'Confirme a senha.'),
};

export const passwordMatch = {
  check: (data: { password: string; passwordConfirmation: string }) =>
    data.password === data.passwordConfirmation,
  options: {
    message: 'As senhas não conferem.',
    path: ['passwordConfirmation'],
  },
};

export const sharedUserSchema = z.object(sharedUserFields).refine(
  passwordMatch.check,
  passwordMatch.options,
);
