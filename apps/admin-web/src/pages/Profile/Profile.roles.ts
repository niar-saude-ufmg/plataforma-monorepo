import type { UserRole } from '@niar/contracts';
import type { ProfileRoleConfig } from '../../types/role-profile';

export const PROFILE_ROLE_CONFIG: Partial<Record<UserRole, ProfileRoleConfig>> = {
  admin: {
    description: 'Gerencie seus dados pessoais e as permissões de acesso à plataforma.',
    accessProfileLabel: 'Administrador',
    sections: ['account', 'access'],
    fields: {
      fullName: { visible: true, editable: true },
      email: { visible: true, editable: true },
      phone: { visible: false, editable: false },
    },
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
};
