import type { UserRole } from "@niar/contracts";
import { z } from "zod";

// Dados de contato. Vira uma linha em shared.user_profiles.
const profileSchema = z.object({
  phone: z.string().min(1, { message: "Phone is required" }),
  institution: z.string().min(1, { message: "Institution is required" }),
  organizational_unit: z.string().min(1, { message: "Organizational unit is required" }),
  contact_address: z.string().min(1, { message: "Contact address is required" })
});

// Dados acadêmicos. Vira uma linha em admin.researcher_profiles.
const researcherProfileSchema = z.object({
  research_area: z.string().min(1, { message: "Research area is required" }),
  position: z.string().min(1, { message: "Position is required" })
});

// Dados do parecer do comitê de ética. Vira uma linha em admin.user_coep_data.
const coepSchema = z.object({
  caae: z.string().min(1, { message: "CAAE is required" }),
  opinion_number: z.string().min(1, { message: "Opinion number is required" }),
  // A coluna no banco é DATE. Aceita só o formato ISO "AAAA-MM-DD" e recusa
  // datas que não existem no calendário (ex.: 2026-02-30), que o construtor
  // Date aceitaria calado virando 2 de março.
  approval_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Approval date must be in YYYY-MM-DD format" })
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
    }, { message: "Approval date is not a valid calendar date" }),
  document_filename: z.string().min(1, { message: "Document filename is required" }),
  document_storage_path: z.string().min(1, { message: "Document storage path is required" })
});
// "role" não existe aqui de propósito — quem decide que é sempre
// "researcher" é o service, não o schema.
export const createPublicUserSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  profile: profileSchema,
  researcher_profile: researcherProfileSchema,
  coep: coepSchema
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

// Retorno da API: dados do cadastro público e blocos vinculados. O caminho interno do documento ("document_storage_path") é omitido por segurança e restringido via TypeScript.
export type PublicUserCreatedResponse = UserResponse & {
  profile: {
    phone: string;
    institution: string;
    organizational_unit: string;
    contact_address: string;
  };
  researcher_profile: {
    research_area: string;
    position: string;
  };
  coep: {
    caae: string;
    opinion_number: string;
    approval_date: string;
    document_filename: string;
  };
};
