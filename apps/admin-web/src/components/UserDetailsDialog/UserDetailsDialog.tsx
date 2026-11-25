import { Details } from '@niar/ui';
import type { RoleDetailsConfig } from '../../types/role-details';
import type { UserListItem } from '../../types/user.types';

export type UserDetailsDialogProps = {
  open: boolean;
  user: UserListItem | null;
  config?: RoleDetailsConfig<UserListItem>;
  onClose: () => void;
};

export function UserDetailsDialog({ open, user, config, onClose }: UserDetailsDialogProps) {
  if (!user || !config) return null;

  return (
    <Details
      open={open}
      variant="list"
      title={typeof config.title === 'function' ? config.title(user) : config.title}
      description={config.description}
      onClose={onClose}
      sections={config.sections.map((section) => ({
        title: section.title,
        items: section.items.map((item) => ({
          label: item.label,
          value: item.render(user),
        })),
      }))}
    />
  );
}
