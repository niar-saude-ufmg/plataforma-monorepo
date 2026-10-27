import { describe, expect, it } from 'vitest';
import { PROFILE_ROLE_CONFIG } from './Profile.roles';

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
    expect(config?.fields.phone).toEqual({ visible: true, editable: true });
    expect(config?.actions).toContain('downloadCoep');
    expect(config?.sections).toContain('researcherDetails');
  });

  it('não libera o download do COEP para o Administrador', () => {
    expect(PROFILE_ROLE_CONFIG.admin?.actions).not.toContain('downloadCoep');
  });

  it.each(['auditor', 'committee'] as const)('não atribui configuração de outro perfil para %s', (role) => {
    expect(PROFILE_ROLE_CONFIG[role]).toBeUndefined();
  });
});
