import { describe, expect, it } from 'vitest';
import {
  administratorSchema,
  auditorSchema,
  committeeSchema,
  researcherSchema,
  ADMIN_DEFAULTS,
  RESEARCHER_DEFAULTS,
  COMMITTEE_DEFAULTS,
} from './CreateUser.validators';
import { researcherRegistrationSchema } from '../PublicUser/PublicUser.validators';

const validAdmin = {
  fullName: 'Ana Beatriz',
  email: 'ana.souza@niar-saude.org',
  password: 'senhaforte1',
  passwordConfirmation: 'senhaforte1',
};

const validCommittee = {
  ...validAdmin,
  specialtyId: { label: 'Cardiologia', value: '1' },
};

const pdfFile = () =>
  new File(['%PDF-fake'], 'parecer.pdf', { type: 'application/pdf' });

const validResearcher = {
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
  coepDocument: pdfFile(),
};

function fieldErrors(
  result: {
    success: boolean;
    error?: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } };
  },
): Record<string, string[] | undefined> {
  if (result.success || !result.error) {
    throw new Error('esperava falha de validação');
  }
  return result.error.flatten().fieldErrors;
}

describe('administratorSchema', () => {
  it('aceita payload válido', () => {
    expect(administratorSchema.safeParse(validAdmin).success).toBe(true);
  });

  it('rejeita fullName vazio', () => {
    const errors = fieldErrors(administratorSchema.safeParse({ ...validAdmin, fullName: '' }));
    expect(errors.fullName).toContain('Informe o nome completo.');
  });

  it('rejeita fullName só com espaços (trim)', () => {
    const errors = fieldErrors(administratorSchema.safeParse({ ...validAdmin, fullName: '   ' }));
    expect(errors.fullName).toBeDefined();
  });

  it('rejeita e-mail inválido', () => {
    const errors = fieldErrors(administratorSchema.safeParse({ ...validAdmin, email: 'nao-e-email' }));
    expect(errors.email).toContain('Informe um e-mail válido.');
  });

  it('rejeita senha com menos de 8 caracteres', () => {
    const errors = fieldErrors(administratorSchema.safeParse({
      ...validAdmin,
      password: 'curta',
      passwordConfirmation: 'curta',
    }));
    expect(errors.password).toContain('A senha precisa ter pelo menos 8 caracteres.');
  });

  it('rejeita senhas diferentes e aponta o erro em passwordConfirmation', () => {
    const errors = fieldErrors(administratorSchema.safeParse({
      ...validAdmin,
      passwordConfirmation: 'outrasenha1',
    }));
    expect(errors.passwordConfirmation).toContain('As senhas não conferem.');
  });
});

describe('auditorSchema', () => {
  it('aceita payload válido', () => {
    expect(auditorSchema.safeParse(validAdmin).success).toBe(true);
  });

  it('aplica a mesma regra de confirmação de senha', () => {
    const errors = fieldErrors(auditorSchema.safeParse({
      ...validAdmin,
      passwordConfirmation: 'outra',
    }));
    expect(errors.passwordConfirmation).toContain('As senhas não conferem.');
  });
});

describe('committeeSchema', () => {
  it('aceita specialtyId preenchido', () => {
    expect(committeeSchema.safeParse(validCommittee).success).toBe(true);
  });

  it('rejeita specialtyId null', () => {
    const errors = fieldErrors(committeeSchema.safeParse({
      ...validCommittee,
      specialtyId: null,
    }));
    expect(errors.specialtyId).toContain('Selecione uma especialidade.');
  });

  it('rejeita specialtyId sem shape esperado', () => {
    const result = committeeSchema.safeParse({
      ...validCommittee,
      specialtyId: { foo: 'bar' },
    });
    expect(result.success).toBe(false);
  });

  it('aplica a mesma regra de confirmação de senha', () => {
    const errors = fieldErrors(committeeSchema.safeParse({
      ...validCommittee,
      passwordConfirmation: 'outra',
    }));
    expect(errors.passwordConfirmation).toContain('As senhas não conferem.');
  });
});

describe('researcherSchema', () => {
  it('é o mesmo schema do cadastro público', () => {
    expect(researcherSchema).toBe(researcherRegistrationSchema);
  });

  it('aceita payload de pesquisador válido (confirma que o alias funciona)', () => {
    expect(researcherSchema.safeParse(validResearcher).success).toBe(true);
  });
});

describe('defaults por role', () => {
  it('ADMIN_DEFAULTS tem os 4 campos básicos vazios', () => {
    expect(ADMIN_DEFAULTS).toEqual({
      fullName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    });
  });

  it('RESEARCHER_DEFAULTS cobre todos os campos do schema do pesquisador', () => {
    const keys = Object.keys(RESEARCHER_DEFAULTS).sort();
    expect(keys).toEqual([
      'approvalDate',
      'caae',
      'coepDocument',
      'contactAddress',
      'email',
      'fullName',
      'institution',
      'opinionNumber',
      'organizationalUnit',
      'password',
      'passwordConfirmation',
      'phone',
      'position',
      'researchArea',
    ]);
  });

  it('COMMITTEE_DEFAULTS começa com specialtyId null', () => {
    expect(COMMITTEE_DEFAULTS.specialtyId).toBeNull();
    expect(COMMITTEE_DEFAULTS.fullName).toBe('');
  });
});
