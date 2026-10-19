import type { UserRole } from '@niar/contracts';

export type ProfileRole = Extract<UserRole, 'admin' | 'researcher'>;

export type ProfileSectionId = 'access' | 'researcherDetails';

export type ProfileFieldId = 'fullName' | 'email' | 'phone';

export type ProfileActionId = 'editProfile' | 'changePassword' | 'downloadCoep';

export type ProfileRoleConfig = {
  description: string;
  accessProfileLabel: string;
  sections: readonly ProfileSectionId[];
  editableFields: readonly ProfileFieldId[];
  actions: readonly ProfileActionId[];
};
