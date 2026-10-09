import type { UserRole } from "@niar/contracts";
import { user_account_status } from "@niar/database";
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
  document_filename: z.string().min(1, { message: "Document filename is required" })
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

// O cadastro administrativo do pesquisador usa exatamente o mesmo contrato
// de dados do cadastro público. A diferença de fluxo (conta ativa e avaliação
// inicial aprovada pelo admin) fica no service, nunca no payload do cliente.
export const createResearcherSchema = createPublicUserSchema;

export type CreateResearcherInput = CreatePublicUserInput;

export const createCommitteeMemberSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  specialty_id: z.number().int().positive(),
});

export type CreateCommitteeMemberInput = z.infer<typeof createCommitteeMemberSchema>;

export const createAdministratorSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type CreateAdministratorInput = z.infer<typeof createAdministratorSchema>;

export const userAccountStatusSchema = z.enum(["pending", "active", "rejected", "disabled"]);

export const listUsersQuerySchema = z.object({
  role: z.enum(["researcher", "admin", "committee"]).optional(),
  account_status: userAccountStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(100).default(20)
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const userAuthEvaluationParamsSchema = z.object({
  user_id: z.coerce.number().int().positive()
});

export const createUserAuthEvaluationSchema = z.object({
  status: z.nativeEnum(user_account_status),
  justification: z.string().trim().min(1).optional()
});

export type CreateUserAuthEvaluationInput = z.infer<typeof createUserAuthEvaluationSchema>;

export type UserAuthEvaluationResponse = {
  id: number;
  user_id: number;
  status: user_account_status;
  justification: string | null;
  evaluated_by_user_id: number;
  evaluated_at: string;
  created_at: string;
  user_coep_data_id: number | null;
};

// Contrato de saída da API: de propósito não tem "password" nem
// "hashed_password" aqui. Isso é o que garante, em nível de tipo, que
// nenhuma camada acima consiga devolver esses campos por engano.
export type UserResponse = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

export type ConsolidatedUserResponse = UserResponse & {
  account_status: user_account_status;
  profile: {
    phone: string | null;
    institution: string | null;
    organizational_unit: string | null;
    contact_address: string | null;
  } | null;
  researcher_profile: {
    research_area: string | null;
    position: string | null;
  } | null;
  committee_profile: {
    specialty: {
      id: number;
      code: string;
      name: string;
    };
  } | null;
  coep: {
    id: number;
    caae: string;
    opinion_number: string;
    approval_date: string;
    document_filename: string;
    download_url: string;
  } | null;
  latest_auth_evaluation: {
    id: number;
    user_id: number;
    status: user_account_status;
    justification: string | null;
    evaluated_by_user_id: number | null;
    evaluated_at: string | null;
    created_at: string;
    user_coep_data_id: number | null;
  } | null;
};

export type PaginatedUsersResponse = {
  items: ConsolidatedUserResponse[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
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
