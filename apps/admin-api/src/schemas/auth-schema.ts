import { z } from "zod";
import type { UserAccountStatus, UserRole } from "@niar/contracts";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" })
});

export type LoginInput = z.infer<typeof loginSchema>;

// PATCH /auth/me: nome, e-mail, telefone do pesquisador e senha. ".strict()"
// recusa qualquer outra chave com 400.
export const updateMeSchema = z
  .object({
    full_name: z.string().min(1, { message: "Full name is required" }).optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    phone: z.string().min(1, { message: "Phone is required" }).max(50).optional(),
    current_password: z.string().min(1, { message: "Current password is required" }).optional(),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }).optional()
  })
  .strict()
  // Trocar a senha exige current_password; se ela confere é o service que checa.
  .refine((data) => !data.password || Boolean(data.current_password), {
    message: "Current password is required to set a new password",
    path: ["current_password"]
  })
  // Corpo sem nenhum campo editável não tem o que atualizar.
  .refine(
    (data) =>
      data.full_name !== undefined ||
      data.email !== undefined ||
      data.phone !== undefined ||
      data.password !== undefined,
    { message: "Informe ao menos um campo para atualizar" }
  );

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

// Formato único da sessão, usado pelo GET e pelo PATCH /auth/me.
export type SessionUserResponse = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  account_status: UserAccountStatus;
  profile?: {
    phone: string | null;
    institution: string | null;
    organizational_unit: string | null;
    contact_address: string | null;
  };
  researcher_profile?: {
    research_area: string | null;
    position: string | null;
  };
  coep?: {
    caae: string;
    opinion_number: string;
    approval_date: string;
    document_filename: string;
  };
  committee_profile?: {
    specialty: {
      id: number;
      code: string;
      name: string;
      description: string;
      guidance_context: string;
      is_active: boolean;
    };
  };
};
