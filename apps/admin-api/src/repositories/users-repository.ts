import { prisma } from '@niar/database';
import { User, user_role } from '@niar/database';


export class usersRepository {
  async findByEmail(email: string) : Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) : Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  async create(data: { fullName: string; email: string; hashedPassword: string; role?: user_role }): Promise<User> {
    return await prisma.user.create({ data });
  }

  async aprove(userId: number): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }
};
