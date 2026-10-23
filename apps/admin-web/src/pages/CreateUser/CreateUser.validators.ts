import { z } from 'zod';
import {
  researcherRegistrationSchema,
  type ResearcherRegistrationValues,
} from '../PublicUser/PublicUser.validators';
import type { CommitteeSpecialtyOption } from '../../types/user.types';

export const researcherSchema = researcherRegistrationSchema;
export type ResearcherCreateValues = ResearcherRegistrationValues;

const baseFields = {
  fullName: z.string().trim().min(1, 'Informe o nome completo.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
  passwordConfirmation: z.string().min(1, 'Confirme a senha.'),
};

const passwordMatch = {
  check: (data: { password: string; passwordConfirmation: string }) =>
    data.password === data.passwordConfirmation,
  options: { message: 'As senhas não conferem.', path: ['passwordConfirmation'] },
};

export const administratorSchema = z.object({ ...baseFields }).refine(
  passwordMatch.check,
  passwordMatch.options,
);

export const auditorSchema = z.object({ ...baseFields }).refine(
  passwordMatch.check,
  passwordMatch.options,
);

export const committeeSchema = z.object({
  ...baseFields,
  specialtyId: z
    .object({ label: z.string(), value: z.string() })
    .nullable()
    .refine(
      (v): v is CommitteeSpecialtyOption => v !== null,
      { message: 'Selecione uma especialidade.' }),
}).refine(passwordMatch.check, passwordMatch.options);


export type AdministratorCreateValues = z.infer<typeof administratorSchema>;
export type AuditorCreateValues = z.infer<typeof auditorSchema>;
export type CommitteeCreateValues = z.input<typeof committeeSchema>;


export const ADMIN_DEFAULTS = {
  fullName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

export const RESEARCHER_DEFAULTS = {
  ...ADMIN_DEFAULTS,
  phone: '',
  institution: '',
  organizationalUnit: '',
  contactAddress: '',
  researchArea: '',
  position: '',
  caae: '',
  opinionNumber: '',
  approvalDate: '',
  coepDocument: undefined as unknown as File,
};

export const COMMITTEE_DEFAULTS = {
  ...ADMIN_DEFAULTS,
  specialtyId: null,
};
