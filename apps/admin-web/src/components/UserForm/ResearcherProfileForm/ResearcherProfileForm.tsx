import { Input } from '@niar/ui';
import type { ResearcherProfileFormFields } from '../../../types/user.types';
import './ResearcherProfileForm.scss';

type ResearcherProfileFormProps = {
  fields: ResearcherProfileFormFields;
};

export function ResearcherProfileForm({ fields }: ResearcherProfileFormProps) {
  return (
    <section className="researcher-profile-form" aria-labelledby="profile-data-title">
      <h3 id="profile-data-title">Dados institucionais e acadêmicos</h3>
      <div className="researcher-profile-form__grid">
        <Input className="researcher-profile-form__full-row" {...fields.institution} label="Instituição" required fullWidth />
        <Input {...fields.organizationalUnit} label="Unidade organizacional" required fullWidth />
        <Input {...fields.phone} label="Telefone" type="tel" required fullWidth />
        <Input className="researcher-profile-form__full-row" {...fields.contactAddress} label="Endereço de contato" required fullWidth />
        <Input {...fields.researchArea} label="Área de pesquisa" required fullWidth />
        <Input {...fields.position} label="Cargo ou vínculo" required fullWidth />
      </div>
    </section>
  );
}
