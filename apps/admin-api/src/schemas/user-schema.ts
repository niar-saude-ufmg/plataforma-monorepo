import type { UserRole } from "@niar/contracts";
import { z } from "zod";

// "role" não existe aqui de propósito — quem decide que é sempre
// "researcher" é o service, não o schema.
export const createPublicUserSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" })
});

export type CreatePublicUserInput = z.infer<typeof createPublicUserSchema>;

// Só é alcançado pela rota protegida (admin autenticado), por isso
// aceita qualquer papel.
export const createUserByAdminSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  role: z.enum(["researcher", "admin", "committee"])
});

export type CreateUserByAdminInput = z.infer<typeof createUserByAdminSchema>;

export const listUsersQuerySchema = z.object({
  role: z.enum(["researcher", "admin", "committee"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20)
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

// Contrato de saída da API: de propósito não tem "password" nem
// "hashed_password" aqui. Isso é o que garante, em nível de tipo, que
// nenhuma camada acima consiga devolver esses campos por engano.
export type UserResponse = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};
