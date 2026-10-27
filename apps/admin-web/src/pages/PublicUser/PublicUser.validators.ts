import { sharedUserSchema } from '../../hooks/forms/use-shared-user-form/use-shared-user-form.validators';
import { researcherProfileSchema } from '../../hooks/forms/use-researcher-form/use-researcher-form.validators';

/** Composição do cadastro público: dados compartilhados + perfil de pesquisador. */
export const researcherRegistrationSchema = sharedUserSchema.and(researcherProfileSchema);
