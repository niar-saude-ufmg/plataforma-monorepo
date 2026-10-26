import type { UserRole } from '@niar/contracts';

export type ProfileRole = Extract<UserRole, 'admin' | 'researcher'>;

export type ProfileSectionId = 'account' | 'access' | 'researcherDetails';

export type ProfileFieldId = 'fullName' | 'email' | 'phone';

export type ProfileActionId = 'editProfile' | 'changePassword' | 'downloadCoep';

export type ProfileFieldConfig = {
  visible: boolean;
  editable: boolean;
};

export type ProfileRoleConfig = {
  description: string;
  accessProfileLabel: string;
  sections: readonly ProfileSectionId[];
  fields: Readonly<Record<ProfileFieldId, ProfileFieldConfig>>;
  actions: readonly ProfileActionId[];
};
