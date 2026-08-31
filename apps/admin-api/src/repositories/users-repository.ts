import { prisma } from "@niar/database";

// hashedPassword fica de fora de propósito: como o select já não busca o
// campo, ele nunca existe em memória nas camadas acima (service/controller),
// então não tem como vazar por esquecimento na resposta da API.
const userListSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  createdAt: true
};

export type UserListRecord = {
  id: number;
  email: string;
  fullName: string;
  role: "researcher" | "admin";
  isActive: boolean;
  createdAt: Date;
};

export const usersRepository = {
  // Única camada que acessa o Prisma/banco. Service e controller não sabem
  // que existe um Postgres por trás disso.
  findAll: (): Promise<UserListRecord[]> =>
    prisma.user.findMany({
      select: userListSelect,
      orderBy: { id: "asc" }
    })
};
