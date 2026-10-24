import { Select } from '@niar/ui';
import type { CommitteeProfileFormFields, CommitteeSpecialtyOption } from '../../../types/user.types';
import './CommitteeProfileForm.scss';

export type CommitteeProfileFormProps = {
  fields: CommitteeProfileFormFields;
};

export function CommitteeProfileForm({ fields }: CommitteeProfileFormProps) {
  return (
    <section className="committee-profile-form" aria-labelledby="committee-profile-title">
      <h3 id="committee-profile-title">Dados da comissão</h3>
      <Select
        label="Especialidade"
        required
        options={[
          { value: '', label: 'Selecione uma especialidade' },
          ...fields.specialtyId.options,
        ]}
        value={fields.specialtyId.value?.value ?? ''}
        onChange={(event) => {
          const value = event.target.value;
          const option = fields.specialtyId.options.find((item) => item.value === value) ?? null;
          fields.specialtyId.onChange(option as CommitteeSpecialtyOption | null);
        }}
        onBlur={fields.specialtyId.onBlur}
        disabled={fields.specialtyId.loading}
        error={fields.specialtyId.error}
        helperText={fields.specialtyId.loading ? 'Carregando especialidades...' : fields.specialtyId.helperText}
        fullWidth
      />
    </section>
  );
}
