import { ACCESS_TOKEN_STORAGE_KEY } from '@niar/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSpecialty,
  listSpecialties,
  updateSpecialty,
  updateSpecialtyStatus,
} from './specialties.service';

const specialtyResponse = {
  id: 7,
  code: 'epidemiology',
  name: 'Epidemiologia',
  description: 'Descrição',
  guidance_context: 'Orientação',
  is_active: true,
  created_at: '2026-09-04T10:00:00.000Z',
  updated_at: '2026-09-05T10:00:00.000Z',
};

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

describe('specialties admin-api service', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ADMIN_API_URL', 'http://localhost:3333/api/admin/');
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'token-teste');
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('lista com filtros, bearer token e normalização do envelope paginado', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({
      items: [specialtyResponse],
      pagination: { page: 2, page_size: 5, total_items: 12, total_pages: 3 },
    }));

    const result = await listSpecialties({ query: 'epidemio', isActive: false, page: 2, pageSize: 5 });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://localhost:3333/api/admin/specialties?query=epidemio&is_active=false&page=2&page_size=5');
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-teste');
    expect(result).toEqual({
      items: [{
        id: 7,
        code: 'epidemiology',
        name: 'Epidemiologia',
        description: 'Descrição',
        guidanceContext: 'Orientação',
        isActive: true,
        createdAt: '2026-09-04T10:00:00.000Z',
        updatedAt: '2026-09-05T10:00:00.000Z',
      }],
      pagination: { page: 2, pageSize: 5, totalItems: 12, totalPages: 3 },
    });
  });

  it('cria uma especialidade com o contrato snake_case da API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(specialtyResponse, 201));

    await createSpecialty({
      code: ' epidemiology ',
      name: ' Epidemiologia ',
      description: 'Descrição',
      guidanceContext: 'Orientação',
    });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://localhost:3333/api/admin/specialties');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      code: 'epidemiology',
      name: 'Epidemiologia',
      description: 'Descrição',
      guidance_context: 'Orientação',
    });
  });

  it('edita somente os campos permitidos, sem enviar code', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(specialtyResponse));

    await updateSpecialty(7, { name: 'Novo nome', description: 'Nova descrição', guidanceContext: 'Novo contexto' });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://localhost:3333/api/admin/specialties/7');
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({
      name: 'Novo nome',
      description: 'Nova descrição',
      guidance_context: 'Novo contexto',
    });
    expect(init?.body).not.toContain('code');
  });

  it.each([true, false])('altera o status para %s pelo endpoint dedicado', async (isActive) => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({
      ...specialtyResponse,
      is_active: isActive,
    }));

    const result = await updateSpecialtyStatus(7, isActive);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://localhost:3333/api/admin/specialties/7/status');
    expect(init?.method).toBe('PATCH');
    expect(JSON.parse(String(init?.body))).toEqual({ is_active: isActive });
    expect(result.isActive).toBe(isActive);
  });

  it.each([
    [401, 'Sua sessão expirou. Entre novamente.'],
    [403, 'Você não tem permissão para gerenciar especialidades.'],
    [404, 'Especialidade não encontrada.'],
    [500, 'Não foi possível concluir a operação. Tente novamente.'],
  ])('normaliza o erro HTTP %s', async (status, message) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: 'erro interno' }, status));

    await expect(listSpecialties()).rejects.toMatchObject({ status, message });
  });

  it.each([
    ['Já existe uma especialidade com este código', 'code'],
    ['Já existe uma especialidade com este nome', 'name'],
  ])('associa conflito 409 ao campo correspondente', async (message, field) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: message }, 409));

    await expect(createSpecialty({ code: 'x', name: 'X' })).rejects.toEqual({
      status: 409,
      message,
      fieldErrors: { [field]: message },
    });
  });

  it.each([400, 422])('normaliza erros de validação com status %s', async (status) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({
      errors: [{ path: ['guidance_context'], message: 'Contexto inválido' }],
    }, status));

    await expect(createSpecialty({ code: 'x', name: 'X' })).rejects.toEqual({
      status,
      message: 'Revise os campos informados.',
      fieldErrors: { guidanceContext: 'Contexto inválido' },
    });
  });

  it('normaliza erro de rede', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(listSpecialties()).rejects.toEqual({ message: 'Não foi possível conectar ao servidor.' });
  });
});
