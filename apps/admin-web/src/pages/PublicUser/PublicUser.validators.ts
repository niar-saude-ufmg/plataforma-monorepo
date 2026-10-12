import { z } from 'zod';

const requiredText = (label: string) =>
  z.string().trim().min(1, `Informe ${label}.`);

const validIsoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, 'Informe uma data válida.');

const pdfFile = z
  .custom<File>((value) => typeof File !== 'undefined' && value instanceof File, 'Anexe o parecer do COEP.')
  .refine((file) => file.size > 0 && file.size <= 10 * 1024 * 1024, 'O PDF deve ter entre 1 byte e 10 MB.')
  .refine((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'), 'Anexe um arquivo PDF.');

export const researcherRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Informe o nome completo do pesquisador.'),
    email: z.string().trim().email('Informe um e-mail válido, como nome@instituicao.org.'),
    password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
    passwordConfirmation: z.string().min(1, 'Confirme a senha.'),
    phone: requiredText('o telefone'),
    institution: requiredText('a instituição'),
    organizationalUnit: requiredText('a unidade organizacional'),
    contactAddress: requiredText('o endereço de contato'),
    researchArea: requiredText('a área de pesquisa'),
    position: requiredText('o cargo ou vínculo'),
    caae: requiredText('o CAAE'),
    opinionNumber: requiredText('o número do parecer'),
    approvalDate: validIsoDate,
    coepDocument: pdfFile,
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'A confirmação de senha deve ser igual à senha informada.',
  });

export type ResearcherRegistrationValues = z.infer<typeof researcherRegistrationSchema>;
