import { describe, expect, it } from 'vitest';
import { PROFILE_ROLE_CONFIG } from './Profile.roles';
import type { ProfileRole } from '../../types/role-profile';

const ALL_PROFILE_ROLES: readonly ProfileRole[] = ['admin', 'researcher', 'committee', 'auditor'];

describe('PROFILE_ROLE_CONFIG', () => {
  it('define os campos, seções e ações do Administrador', () => {
    expect(PROFILE_ROLE_CONFIG.admin).toMatchObject({
      sections: ['account', 'access'],
      fields: {
        fullName: { visible: true, editable: true },
        email: { visible: true, editable: true },
        phone: { visible: false, editable: false },
      },
      actions: ['editProfile', 'changePassword'],
    });
  });

  it('define o telefone e o download do COEP para o Pesquisador', () => {
    const config = PROFILE_ROLE_CONFIG.researcher;
    expect(config.fields.phone).toEqual({ visible: true, editable: true });
    expect(config.actions).toContain('downloadCoep');
    expect(config.sections).toContain('researcherDetails');
  });

  it('não libera o download do COEP para o Administrador', () => {
    expect(PROFILE_ROLE_CONFIG.admin.actions).not.toContain('downloadCoep');
  });

  it('define a seção da comissão para o Comitê', () => {
    expect(PROFILE_ROLE_CONFIG.committee).toMatchObject({
      accessProfileLabel: 'Comitê gestor',
      sections: ['account', 'committeeDetails'],
      actions: ['editProfile', 'changePassword'],
    });
    expect(PROFILE_ROLE_CONFIG.committee.sections).not.toContain('access');
  });

  it('define o acesso à plataforma para o Auditor', () => {
    expect(PROFILE_ROLE_CONFIG.auditor).toMatchObject({
      accessProfileLabel: 'Auditor do NIAR',
      sections: ['account', 'access'],
      actions: ['editProfile', 'changePassword'],
    });
    expect(PROFILE_ROLE_CONFIG.auditor.sections).not.toContain('committeeDetails');
  });

  it.each(['committee', 'auditor'] as const)('esconde o telefone e o COEP de %s', (role) => {
    expect(PROFILE_ROLE_CONFIG[role].fields.phone).toEqual({ visible: false, editable: false });
    expect(PROFILE_ROLE_CONFIG[role].actions).not.toContain('downloadCoep');
  });

  it('configura os quatro perfis com nome e e-mail editáveis', () => {
    ALL_PROFILE_ROLES.forEach((role) => {
      const config = PROFILE_ROLE_CONFIG[role];
      expect(config.description.length).toBeGreaterThan(0);
      expect(config.fields.fullName).toEqual({ visible: true, editable: true });
      expect(config.fields.email).toEqual({ visible: true, editable: true });
      expect(config.sections).toContain('account');
      expect(config.actions).toEqual(expect.arrayContaining(['editProfile', 'changePassword']));
    });
  });
});
