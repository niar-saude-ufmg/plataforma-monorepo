import { describe, expect, it } from 'vitest';
import { getRoleNavigation, getRoleRouteDefinitions } from './role-routes';

describe('rotas de especialidades', () => {
  it('publica o caminho administrativo no menu', () => {
    expect(getRoleNavigation('admin')).toContainEqual({
      label: 'Especialidades', path: '/admin/administrador/especialidades',
    });
  });

  it.each(['researcher', 'committee', 'auditor'] as const)('não disponibiliza rota ou menu para %s', (role) => {
    expect(getRoleRouteDefinitions(role).some(({ section }) => section === 'especialidades')).toBe(false);
    expect(getRoleNavigation(role).some(({ label }) => label === 'Especialidades')).toBe(false);
  });
});
