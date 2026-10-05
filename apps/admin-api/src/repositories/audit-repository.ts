import { Prisma, prisma } from '@niar/database';

type AuditDatabaseClient = Prisma.TransactionClient | typeof prisma;

export const auditRepository = {
  create: (data: {
    userId: number | null;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: string;
    ipAddress?: string;
  }, client: AuditDatabaseClient = prisma) => client.auditLog.create({ data }),
};
