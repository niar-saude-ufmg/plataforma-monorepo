import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { ConsolidatedUserRecord } from '../src/repositories/users-repository.js';
import type { AuthenticatedUser } from '../src/middlewares/auth.js';

process.env.SECRET_KEY = 'test-secret';
const findById = jest.fn<() => Promise<AuthenticatedUser | null>>();
const findDetailById = jest.fn<() => Promise<ConsolidatedUserRecord | null>>();
const updateStatus = jest.fn<() => Promise<ConsolidatedUserRecord>>();
jest.unstable_mockModule('../src/repositories/users-repository.js', () => ({
  usersRepository: { findById, findDetailById, updateStatus },
}));
const { app } = await import('../src/app.js');
const token = jwt.sign({ sub: '1' }, process.env.SECRET_KEY);
const actor: AuthenticatedUser = { id: 1, fullName: 'Admin', email: 'admin@example.org', role: 'admin', accountStatus: 'active' };
const target = (status: 'active' | 'disabled' | 'pending' | 'rejected' = 'active'): ConsolidatedUserRecord => ({
  id: 2, fullName: 'Usuário', email: 'user@example.org', role: 'committee', accountStatus: status,
  createdAt: new Date('2026-01-01'), profile: null, researcherProfile: null, committeeProfile: null, coepData: [], authEvaluations: [],
});
const patch = (body: Record<string, unknown>) => request(app).patch('/api/admin/users/2/auth-evaluation').set('Authorization', `Bearer ${token}`).send(body);
beforeEach(() => { jest.resetAllMocks(); findById.mockResolvedValue(actor); });

describe('PATCH /api/admin/users/:user_id/auth-evaluation', () => {
  it.each([['active', 'disabled'], ['disabled', 'active']] as Array<['active' | 'disabled', 'active' | 'disabled']>)('altera %s para %s', async (previous, status) => {
    findDetailById.mockResolvedValue(target(previous));
    updateStatus.mockResolvedValue(target(status));
    const response = await patch({ status });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: 2, account_status: status });
    expect(response.body).not.toHaveProperty('hashedPassword');
    expect(updateStatus).toHaveBeenCalledWith({ userId: 2, expectedStatus: previous, status, actorUserId: 1 });
  });
  it.each(['researcher', 'committee'] as const)('bloqueia %s', async (role) => {
    findById.mockResolvedValue({ ...actor, role });
    expect((await patch({ status: 'disabled' })).status).toBe(403);
    expect(updateStatus).not.toHaveBeenCalled();
  });
  it('exige autenticação', async () => {
    expect((await request(app).patch('/api/admin/users/2/auth-evaluation').send({ status: 'disabled' })).status).toBe(401);
  });
  it.each(['pending', 'rejected', 'disabled'] as const)('não desativa conta %s', async (status) => {
    findDetailById.mockResolvedValue(target(status));
    expect((await patch({ status: 'disabled' })).status).toBe(409);
    expect(updateStatus).not.toHaveBeenCalled();
  });
  it.each(['pending', 'rejected', 'active'] as const)('não ativa conta %s', async (status) => {
    findDetailById.mockResolvedValue(target(status));
    expect((await patch({ status: 'active' })).status).toBe(409);
  });
  it('retorna 404 para usuário inexistente', async () => {
    findDetailById.mockResolvedValue(null);
    expect((await patch({ status: 'disabled' })).status).toBe(404);
  });
  it.each([{ status: 'pending' }, { status: 'disabled', role: 'admin' }, {}])('recusa payload inválido %j', async (body) => {
    expect((await patch(body)).status).toBe(400);
    expect(updateStatus).not.toHaveBeenCalled();
  });
});


it('impede o administrador de desativar a própria conta', async () => {
  const response = await request(app).patch('/api/admin/users/1/auth-evaluation')
    .set('Authorization', `Bearer ${token}`).send({ status: 'disabled' });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Você não pode desativar a própria conta');
  expect(updateStatus).not.toHaveBeenCalled();
});
