import { DatePicker, FileUpload, Input } from '@niar/ui';
import type { CoepUserFormFields } from '../../../types/user.types';
import './CoepUserForm.scss';

type CoepUserFormProps = {
  fields: CoepUserFormFields;
};

export function CoepUserForm({ fields }: CoepUserFormProps) {
  return (
    <section className="coep-user-form" aria-labelledby="coep-data-title">
      <h3 id="coep-data-title">Parecer do COEP</h3>
      <div className="coep-user-form__grid">
        <Input {...fields.caae} label="CAAE" fullWidth />
        <Input {...fields.opinionNumber} label="Número do parecer" fullWidth />
        <DatePicker {...fields.approvalDate} label="Data de aprovação" fullWidth />
      </div>
      <div className="coep-user-form__file-field">
        <FileUpload
          label="Selecionar parecer em PDF"
          description="Envie o parecer do COEP em PDF, com até 10 MB."
          accept="application/pdf,.pdf"
          onChange={(files) => fields.coepDocument.onChange(files[0])}
        />
        {fields.coepDocument.error ? (
          <span className="coep-user-form__field-error" role="alert">{fields.coepDocument.error}</span>
        ) : null}
      </div>
    </section>
  );
}
