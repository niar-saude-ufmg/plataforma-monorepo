import { z } from "zod";

export const projectVersionIdParamSchema = z.object({
  project_version_id: z.coerce.number().int().positive()
});

export const assignCommitteeEvaluationSchema = z
  .object({
    responsible_member_user_id: z.number().int().positive().optional()
  })
  .strict();

export type AssignCommitteeEvaluationInput = z.infer<typeof assignCommitteeEvaluationSchema>;

export const finalizeCommitteeEvaluationSchema = z
  .object({
    result: z.enum(["approved", "needs_changes", "rejected"]),
    justification: z.string().optional()
  })
  .strict();

export type FinalizeCommitteeEvaluationInput = z.infer<typeof finalizeCommitteeEvaluationSchema>;

export type CommitteeEvaluationResponse = {
  id: number;
  project_version: {
    id: number;
    project_id: number;
    version_number: number;
    status: string;
    user_coep_data_id: number | null;
    submitted_at: string | null;
    created_at: string;
  };
  project: {
    id: number;
    owner_user_id: number;
    title: string;
  };
  responsible_member: {
    user_id: number;
    full_name: string;
    email: string;
    specialty: {
      id: number;
      code: string;
      name: string;
    };
  };
  result: "to_review" | "approved" | "needs_changes" | "rejected" | null;
  justification: string | null;
  evaluated_at: string | null;
  created_at: string;
  updated_at: string;
};
