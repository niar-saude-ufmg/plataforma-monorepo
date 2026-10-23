import { Button, Form, Input, StatusChip, Textarea } from '@niar/ui';
import { Fragment, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { z } from 'zod';
import { useForm } from '../../hooks/forms/use-form/use-form';
import { useAppSelector } from '../../store/hooks';
import { selectSpecialtiesMutationError, selectSpecialtiesMutationLoading } from '../../store/specialties/specialties.selectors';
import type { Specialty } from '../../types/specialty.types';
import './SpecialtyForm.scss';

const schema = z.object({
  code: z.string().trim().min(1, 'Informe o código.').max(100, 'Use até 100 caracteres.'),
  name: z.string().trim().min(1, 'Informe o nome.').max(255, 'Use até 255 caracteres.'),
  description: z.string().max(2000, 'Use até 2000 caracteres.'),
  guidanceContext: z.string().max(4000, 'Use até 4000 caracteres.'),
});

export type SpecialtyFormValues = z.infer<typeof schema>;

const emptyValues: SpecialtyFormValues = { code: '', name: '', description: '', guidanceContext: '' };
const fields = [
  ['name', 'Nome'],
  ['code', 'Código'],
  ['description', 'Descrição'],
  ['guidanceContext', 'Contexto de orientação'],
] as const;

type SpecialtyFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Specialty;
  onSubmit: (values: SpecialtyFormValues) => Promise<void>;
  onCancel: () => void;
};

export function SpecialtyForm({ mode, initialValues, onSubmit, onCancel }: SpecialtyFormProps) {
  const loading = useAppSelector(selectSpecialtiesMutationLoading);
  const error = useAppSelector(selectSpecialtiesMutationError);
  const { control, handleSubmit, reset, applyApiFieldErrors, formState: { isSubmitting } } = useForm({
    schema,
    defaultValues: emptyValues,
  });
  const busy = loading || isSubmitting;

  useEffect(() => {
    reset(mode === 'edit' && initialValues ? {
      code: initialValues.code,
      name: initialValues.name,
      description: initialValues.description,
      guidanceContext: initialValues.guidanceContext,
    } : emptyValues);
  }, [mode, initialValues, reset]);

  useEffect(() => {
    if (error) applyApiFieldErrors(error);
  }, [error, applyApiFieldErrors]);

  return (
    <Form
      title={mode === 'create' ? 'Cadastrar especialidade' : 'Editar especialidade'}
      description={mode === 'create'
        ? 'Adicione uma nova especialidade ao catálogo.'
        : 'Atualize os dados da especialidade selecionada.'}
    >
      <form className="specialty-form" aria-label="Formulário de especialidade" noValidate onSubmit={handleSubmit(async (values) => {
        if (!busy) await onSubmit(values);
      })}>
        <h2 className="specialty-form__heading">
          {mode === 'create' ? 'Dados da especialidade' : 'Editar dados da especialidade'}
        </h2>
        <div className="specialty-form__grid">
          {fields.map(([name, label]) => (
            <Fragment key={name}>
              <Controller name={name} control={control} render={({ field: { ref, ...field }, fieldState }) => {
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
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                );
              }} />
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
          <Button type="submit" variant="contained" disabled={busy}>{busy ? 'Salvando…' : mode === 'create' ? 'Cadastrar' : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  );
}
