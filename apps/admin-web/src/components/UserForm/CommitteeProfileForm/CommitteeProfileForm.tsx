import { Autocomplete } from '@niar/ui';
import type { CommitteeProfileFormFields, CommitteeSpecialtyOption } from 'apps/admin-web/src/types/user.types';
import './CommitteeProfileForm.scss';

export type CommitteeProfileFormProps = {
  fields: CommitteeProfileFormFields;
};

export function CommitteeProfileForm({ fields }: CommitteeProfileFormProps) {
  return (
    <section className="committee-profile-form" aria-labelledby="committee-profile-title">
      <h3 id="committee-profile-title">Dados da comissão</h3>
      <Autocomplete
        label="Especialidade"
        options={fields.specialtyId.options}
        value={fields.specialtyId.value}
        onChange={(_event, value) =>
          fields.specialtyId.onChange(value as CommitteeSpecialtyOption | null)
        }
        onBlur={fields.specialtyId.onBlur}
        loading={fields.specialtyId.loading}
      />
    </section>
  );
}
