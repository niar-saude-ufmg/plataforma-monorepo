import { describe, expect, it } from 'vitest';
import { researcherRegistrationSchema } from './PublicUser.validators';

const validRegistration = {
  fullName: 'Ana Beatriz Souza',
  email: 'ana.souza@niar-saude.org',
  password: 'senhaforte1',
  passwordConfirmation: 'senhaforte1',
  phone: '(31) 99999-9999',
  institution: 'UFMG',
  organizationalUnit: 'Faculdade de Medicina',
  contactAddress: 'Belo Horizonte - MG',
  researchArea: 'Saúde pública',
  position: 'Professora',
  caae: '12345678.9.0000.0000',
  opinionNumber: '1234.567',
  approvalDate: '2026-09-25',
  coepDocument: new File(['pdf'], 'parecer-coep.pdf', { type: 'application/pdf' }),
};

describe('researcherRegistrationSchema', () => {
  it('valida a confirmação pela igualdade com a senha', () => {
    const result = researcherRegistrationSchema.safeParse({
      ...validRegistration,
      passwordConfirmation: 'abc',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual({
        code: 'custom',
        path: ['passwordConfirmation'],
        message: 'A confirmação de senha deve ser igual à senha informada.',
      });
    }
  });

  it('aceita a confirmação quando ela coincide com a senha', () => {
    expect(researcherRegistrationSchema.safeParse(validRegistration).success).toBe(true);
  });
});
