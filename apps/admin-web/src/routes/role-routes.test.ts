import { describe, expect, it } from 'vitest';
import {
  getRoleNavigation,
  getRoleRouteDefinitions,
} from './role-routes';

describe('rotas de especialidades', () => {
  it('publica o caminho administrativo no menu', () => {
    expect(getRoleNavigation('admin')).toContainEqual({
      label: 'Especialidades', path: '/admin/administrador/especialidades',
    });
  });

  it('mantém novo usuário como subrota da listagem', () => {
    expect(getRoleNavigation('admin')).not.toContainEqual({
      label: 'Novo usuário',
      path: '/admin/administrador/usuarios/novo',
    });
  });

  it.each(['researcher', 'committee'] as const)('não disponibiliza rota ou menu para %s', (role) => {
    expect(getRoleRouteDefinitions(role).some(({ section }) => section === 'especialidades')).toBe(false);
    expect(getRoleNavigation(role).some(({ label }) => label === 'Especialidades')).toBe(false);
  });
});

describe('rotas de perfil', () => {
  it.each([
    ['admin', '/admin/administrador/perfil'],
    ['researcher', '/admin/pesquisador/perfil'],
    ['committee', '/admin/comite/perfil'],
  ] as const)('publica o Perfil no menu de %s', (role, path) => {
    expect(getRoleRouteDefinitions(role).some(({ section }) => section === 'perfil')).toBe(true);
    expect(getRoleNavigation(role)).toContainEqual({ label: 'Perfil', path });
  });
});
