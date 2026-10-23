import { Button, Form, Input, StatusChip, Textarea } from '@niar/ui';
import { Fragment } from 'react';
import type { SpecialtyFormFields } from '../../hooks/forms/use-specialty-form/use-specialty-form';
import type { Specialty } from '../../types/specialty.types';
import './SpecialtyForm.scss';
const fieldDefinitions = [
  ['name', 'Nome'],
  ['code', 'Código'],
  ['description', 'Descrição'],
  ['guidanceContext', 'Contexto de orientação'],
] as const;

type SpecialtyFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Specialty;
  fields: SpecialtyFormFields;
  busy: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function SpecialtyForm({
  mode,
  initialValues,
  fields,
  busy,
  onSubmit,
  onCancel,
}: SpecialtyFormProps) {
  return (
    <Form
      title={mode === 'create' ? 'Cadastrar especialidade' : 'Editar especialidade'}
      description={mode === 'create'
        ? 'Adicione uma nova especialidade ao catálogo.'
        : 'Atualize os dados da especialidade selecionada.'}
    >
      <div className="specialty-form" aria-label="Formulário de especialidade">
        <h2 className="specialty-form__heading">
          {mode === 'create' ? 'Dados da especialidade' : 'Editar dados da especialidade'}
        </h2>
        <div className="specialty-form__grid">
          {fieldDefinitions.map(([name, label]) => (
            <Fragment key={name}>
              {(() => {
                const controller = fields[name];
                const { ref, ...field } = controller.field;
                const longText = name === 'description' || name === 'guidanceContext';
                const Field = longText ? Textarea : Input;

                return (
                  <Field
                    {...field}
                    inputRef={ref}
                    className={longText ? 'specialty-form__long-field' : undefined}
                    label={label}
                    required={name === 'code' || name === 'name'}
                    disabled={busy || (mode === 'edit' && name === 'code')}
                    error={Boolean(controller.fieldState.error)}
                    helperText={controller.fieldState.error?.message}
                    fullWidth
                  />
                );
              })()}
              {name === 'description' && mode === 'edit' && initialValues && (
                <div className="specialty-form__status">
                  <span>Status</span>
                  <StatusChip
                    label={initialValues.isActive ? 'Ativa' : 'Inativa'}
                    status={initialValues.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <div className="specialty-form__actions">
          <Button type="button" variant="outlined" onClick={onCancel} disabled={busy}>Cancelar</Button>
          <Button type="button" variant="contained" onClick={onSubmit} disabled={busy}>{busy ? 'Salvando…' : mode === 'create' ? 'Cadastrar' : 'Salvar'}</Button>
        </div>
      </div>
    </Form>
  );
}
