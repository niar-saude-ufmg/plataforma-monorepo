import { z } from "zod";

export const createUserSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  role: z.enum(["researcher", "admin"]).default("researcher")
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Contrato de saída da API: de propósito não tem "password" nem
// "hashed_password" aqui. Isso é o que garante, em nível de tipo, que
// nenhuma camada acima consiga devolver esses campos por engano.
export type UserResponse = {
  id: number;
  email: string;
  full_name: string;
  role: "researcher" | "admin";
  is_active: boolean;
  created_at: string;
};
