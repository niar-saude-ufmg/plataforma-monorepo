import { prisma } from '@niar/database';

export const auditRepository = {
  create: (data: {
    userId: number | null;
    action: string;
    resourceType: string;
    resourceId: string;
    details?: string;
    ipAddress?: string;
  }) => prisma.auditLog.create({ data }),
};
