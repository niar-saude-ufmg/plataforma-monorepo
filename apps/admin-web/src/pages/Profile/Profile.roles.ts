import type {
  ProfileActionId,
  ProfileFieldId,
  ProfileRole,
  ProfileRoleConfig,
  ProfileSectionId,
} from '../../types/role-profile';

export type { ProfileRole } from '../../types/role-profile';

export const PROFILE_ROLE_CONFIG: Record<ProfileRole, ProfileRoleConfig> = {
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

export const getProfileRoleConfig = (role: ProfileRole) => PROFILE_ROLE_CONFIG[role];

export const hasProfileAction = (role: ProfileRole, action: ProfileActionId) =>
  getProfileRoleConfig(role).actions.includes(action);

export const hasProfileSection = (role: ProfileRole, section: ProfileSectionId) =>
  getProfileRoleConfig(role).sections.includes(section);

export const isProfileFieldVisible = (role: ProfileRole, field: ProfileFieldId) =>
  getProfileRoleConfig(role).fields[field].visible;

export const isProfileFieldEditable = (role: ProfileRole, field: ProfileFieldId) =>
  getProfileRoleConfig(role).fields[field].editable;
