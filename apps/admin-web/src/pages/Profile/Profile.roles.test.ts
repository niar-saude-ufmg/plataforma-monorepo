import { describe, expect, it } from 'vitest';
import {
  getProfileRoleConfig,
  hasProfileAction,
  hasProfileSection,
  isProfileFieldEditable,
  isProfileFieldVisible,
} from './Profile.roles';

describe('PROFILE_ROLE_CONFIG', () => {
  it('define os campos, seções e ações do Administrador', () => {
    expect(getProfileRoleConfig('admin')).toMatchObject({
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
    expect(isProfileFieldVisible('researcher', 'phone')).toBe(true);
    expect(isProfileFieldEditable('researcher', 'phone')).toBe(true);
    expect(hasProfileAction('researcher', 'downloadCoep')).toBe(true);
    expect(hasProfileSection('researcher', 'researcherDetails')).toBe(true);
  });

  it('não libera o download do COEP para o Administrador', () => {
    expect(hasProfileAction('admin', 'downloadCoep')).toBe(false);
  });
});
