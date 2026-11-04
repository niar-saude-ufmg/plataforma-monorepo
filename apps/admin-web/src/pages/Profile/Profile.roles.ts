import type { ProfileRole, ProfileRoleConfig } from '../../types/role-profile';

// Só nome e e-mail são editáveis fora do Pesquisador; o telefone nem aparece.
const basicAccountFields = {
  fullName: { visible: true, editable: true },
  email: { visible: true, editable: true },
  phone: { visible: false, editable: false },
} as const;

export const PROFILE_ROLE_CONFIG: Record<ProfileRole, ProfileRoleConfig> = {
  admin: {
    description: 'Gerencie seus dados pessoais e as permissões de acesso à plataforma.',
    accessProfileLabel: 'Administrador',
    sections: ['account', 'access'],
    fields: basicAccountFields,
    actions: ['editProfile', 'changePassword'],
  },
  researcher: {
    description: 'Gerencie seus dados pessoais, acadêmicos e informações do COEP.',
    accessProfileLabel: 'Pesquisador',
    sections: ['account', 'researcherDetails'],
    fields: {
      fullName: { visible: true, editable: true },
      email: { visible: true, editable: true },
      phone: { visible: true, editable: true },
    },
    actions: ['editProfile', 'changePassword', 'downloadCoep'],
  },
  committee: {
    description: 'Gerencie seus dados pessoais e as informações do seu vínculo com a comissão.',
    accessProfileLabel: 'Comitê gestor',
    sections: ['account', 'committeeDetails'],
    fields: basicAccountFields,
    actions: ['editProfile', 'changePassword'],
  },
  auditor: {
    description: 'Gerencie seus dados pessoais e as permissões de acesso à plataforma.',
    accessProfileLabel: 'Auditor do NIAR',
    sections: ['account', 'access'],
    fields: basicAccountFields,
    actions: ['editProfile', 'changePassword'],
  },
};
