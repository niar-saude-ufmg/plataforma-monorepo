import { beforeEach, describe, expect, it, jest } from '@jest/globals';
const updateMany = jest.fn<() => Promise<{ count: number }>>();
const findUniqueOrThrow = jest.fn<() => Promise<unknown>>();
const findFirst = jest.fn<() => Promise<{ id: number } | null>>();
const createEvaluation = jest.fn<() => Promise<unknown>>();
const audit = jest.fn<() => Promise<unknown>>();
const transaction = {
  user: { updateMany, findUniqueOrThrow },
  userCoepData: { findFirst },
  userAuthEvaluation: { create: createEvaluation },
};
const runTransaction = jest.fn<(callback: (client: typeof transaction) => Promise<unknown>) => Promise<unknown>>();
jest.unstable_mockModule('@niar/database', () => ({ prisma: { $transaction: runTransaction }, Prisma: {} }));
jest.unstable_mockModule('../src/repositories/audit-repository.js', () => ({ auditRepository: { create: audit } }));
const { usersRepository } = await import('../src/repositories/users-repository.js');
beforeEach(() => { jest.resetAllMocks(); runTransaction.mockImplementation(callback => callback(transaction)); });
describe('usersRepository.updateStatus', () => {
  it('atualiza condicionalmente e registra auditoria na mesma transação', async () => {
    updateMany.mockResolvedValue({ count: 1 });
    findUniqueOrThrow.mockResolvedValue({ id: 2, accountStatus: 'disabled' });
    findFirst.mockResolvedValue({ id: 9 });
    await usersRepository.updateStatus({ userId: 2, expectedStatus: 'active', status: 'disabled', actorUserId: 1 });
    expect(updateMany).toHaveBeenCalledWith({ where: { id: 2, accountStatus: 'active' }, data: { accountStatus: 'disabled' } });
    expect(createEvaluation).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 2,
        status: 'disabled',
        justification: null,
        evaluatedByUserId: 1,
        userCoepDataId: 9,
      }),
    });
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ userId: 1, action: 'deactivate_user', resourceId: '2' }), transaction);
  });
  it('recusa alterações concorrentes antes de registrar auditoria', async () => {
    updateMany.mockResolvedValue({ count: 0 });
    await expect(usersRepository.updateStatus({ userId: 2, expectedStatus: 'active', status: 'disabled', actorUserId: 1 })).rejects.toMatchObject({ statusCode: 409 });
    expect(audit).not.toHaveBeenCalled();
  });
});
