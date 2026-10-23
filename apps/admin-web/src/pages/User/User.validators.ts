import { z } from "zod";
import { USER_ROLE_VALUES } from "@niar/contracts";
import { committeeProfileSchema } from "../../hooks/forms/use-committee-form/use-committee-form.validators";
import {
  researcherProfileSchema,
} from "../../hooks/forms/use-researcher-form/use-researcher-form.validators";
import {
  passwordMatch,
  sharedUserFields,
  sharedUserSchema,
} from "../../hooks/forms/use-shared-user-form/use-shared-user-form.validators";
import type { UserRole } from "../../types/user.types";

export const researcherSchema = sharedUserSchema.and(researcherProfileSchema);

export const administratorSchema = sharedUserSchema;
export const auditorSchema = sharedUserSchema;
export const committeeSchema = sharedUserSchema.and(committeeProfileSchema);

const roleSchema = z.object({
  role: z.enum(USER_ROLE_VALUES, {
    errorMap: () => ({ message: "Selecione o tipo de usuário." }),
  }),
});

const roleSpecificSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("researcher"),
    ...sharedUserFields,
    ...researcherProfileSchema.shape,
  }),
  z.object({
    role: z.literal("admin"),
    ...sharedUserFields,
  }),
  z.object({
    role: z.literal("auditor"),
    ...sharedUserFields,
  }),
  z.object({
    role: z.literal("committee"),
    ...sharedUserFields,
    ...committeeProfileSchema.shape,
  }),
]);

export const userSchema = roleSchema
  .and(roleSpecificSchema)
  .refine(passwordMatch.check, passwordMatch.options);
