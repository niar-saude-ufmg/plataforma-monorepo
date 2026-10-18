import { Card, niar, typographyStyle } from '@niar/ui';
import type { ReactNode } from 'react';

export type ProfileReadonlyProps = {
  title: string;
  children: ReactNode;
};

// Título dentro do card, como no Figma. O PageIntro não serve aqui: ele renderiza sempre variant="h1" e fica fora do Card quando usado pelo Form.
const titleStyle = {
  ...typographyStyle('title'),
  color: niar.colors.text.heading,
  margin: 0,
};

// Genérico de propósito: não conhece role, AuthUser nem regra de perfil. auem decide o que vai dentro é a página.
export function ProfileReadonly({ title, children }: ProfileReadonlyProps) {
  return (
    <Card variant="outlined">
      <h2 style={titleStyle}>{title}</h2>
      {children}
    </Card>
  );
}
