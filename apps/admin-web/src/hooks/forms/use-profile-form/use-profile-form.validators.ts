import { z } from 'zod';

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(1, { message: 'Informe o nome completo.' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Informe o e-mail.' })
    .email({ message: 'Informe um e-mail válido, como nome@instituicao.org.' }),
  phone: z.string().trim().min(1, { message: 'Informe o telefone.' }).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
