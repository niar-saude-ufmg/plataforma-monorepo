import type { ProfileRole, ProfileRoleConfig } from '../../types/role-profile';

export type { ProfileRole } from '../../types/role-profile';

export const PROFILE_ROLE_CONFIG: Record<ProfileRole, ProfileRoleConfig> = {
  admin: {
    description: 'Gerencie seus dados pessoais e as permissões de acesso à plataforma.',
    accessProfileLabel: 'Administrador',
    sections: ['access'],
    editableFields: ['fullName', 'email'],
    actions: ['editProfile', 'changePassword'],
  },
  researcher: {
    description: 'Gerencie seus dados pessoais, acadêmicos e informações do COEP.',
    accessProfileLabel: 'Pesquisador',
    sections: ['researcherDetails'],
    editableFields: ['fullName', 'email', 'phone'],
    actions: ['editProfile', 'changePassword', 'downloadCoep'],
  },
};

