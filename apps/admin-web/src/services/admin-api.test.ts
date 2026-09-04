import { afterEach, describe, expect, it, vi } from 'vitest';
import { createUser, getAdminApiBaseUrl } from './admin-api';

describe('admin-api service', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('usa a VITE_ADMIN_API_URL quando ela estiver definida', () => {
    vi.stubEnv('VITE_ADMIN_API_URL', 'http://localhost:3333/api/admin/');

    expect(getAdminApiBaseUrl()).toBe('http://localhost:3333/api/admin');
  });

  it('usa a origem atual quando a VITE_ADMIN_API_URL não estiver definida', () => {
    vi.stubEnv('VITE_ADMIN_API_URL', '');

    expect(getAdminApiBaseUrl()).toBe(`${window.location.origin}/api/admin`);
  });

  it('envia o payload esperado e normaliza a resposta de sucesso', async () => {
    vi.stubEnv('VITE_ADMIN_API_URL', 'http://localhost:3333/api/admin/');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 7,
          full_name: 'Ana Beatriz Souza',
          email: 'ana.souza@niar-saude.org',
          role: 'researcher',
          is_active: true,
          created_at: '2026-09-04T10:00:00.000Z',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const result = await createUser({
      fullName: 'Ana Beatriz Souza',
      email: 'ana.souza@niar-saude.org',
      password: 'senhaforte1',
      role: 'researcher',
    });

    expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3333/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Ana Beatriz Souza',
        email: 'ana.souza@niar-saude.org',
        password: 'senhaforte1',
        role: 'researcher',
      }),
    });

    expect(result).toEqual({
      id: 7,
      fullName: 'Ana Beatriz Souza',
      email: 'ana.souza@niar-saude.org',
      role: 'researcher',
      createdAt: '2026-09-04T10:00:00.000Z',
    });
  });

  it('normaliza conflito de e-mail duplicado', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'User with this email already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      createUser({
        fullName: 'Ana Beatriz Souza',
        email: 'ana.souza@niar-saude.org',
        password: 'senhaforte1',
        role: 'researcher',
      }),
    ).rejects.toEqual({
      status: 409,
      message: 'Este e-mail já está cadastrado.',
      fieldErrors: {
        email: 'Este e-mail já está cadastrado.',
      },
    });
  });

  it('normaliza erros de validação do backend', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [
            { path: ['email'], message: 'Invalid email address' },
            { path: ['password'], message: 'Password must be at least 8 characters long' },
          ],
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    await expect(
      createUser({
        fullName: 'Ana Beatriz Souza',
        email: 'invalido',
        password: '123',
        role: 'researcher',
      }),
    ).rejects.toEqual({
      status: 400,
      message: 'Revise os campos informados.',
      fieldErrors: {
        email: 'Informe um e-mail válido, como nome@instituicao.org.',
        password: 'A senha precisa ter pelo menos 8 caracteres.',
      },
    });
  });
});
