import { Card } from '@niar/ui';
import type { ReactNode } from 'react';
import './ProfileReadonly.scss';

export type ProfileReadonlyProps = {
  title: string;
  children: ReactNode;
};

// Genérico de propósito: não conhece role, AuthUser nem regra de perfil. auem decide o que vai dentro é a página.
export function ProfileReadonly({ title, children }: ProfileReadonlyProps) {
  return (
    <Card variant="outlined" className="profile-readonly">
      <div className="profile-readonly__content">
        <h2 className="profile-readonly__title">{title}</h2>
        <div className="profile-readonly__body">{children}</div>
      </div>
    </Card>
  );
}
