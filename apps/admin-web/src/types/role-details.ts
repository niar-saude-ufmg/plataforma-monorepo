import type { ReactNode } from 'react';

export type RoleDetailsItem<TItem> = {
  id: string;
  label: string;
  render: (item: TItem) => ReactNode;
};

export type RoleDetailsSection<TItem> = {
  id: string;
  title?: string;
  items: readonly RoleDetailsItem<TItem>[];
};

export type RoleDetailsConfig<TItem> = {
  title: string | ((item: TItem) => string);
  description?: string;
  sections: readonly RoleDetailsSection<TItem>[];
};
