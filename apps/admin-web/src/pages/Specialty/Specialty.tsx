import { Snackbar } from '@niar/ui';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SpecialtyForm } from '../../components/SpecialtyForm';
import { useApiError } from '../../hooks/use-api-error/use-api-error';
import { useSpecialtyForm, type SpecialtyFormValues } from '../../hooks/forms/use-specialty-form/use-specialty-form';
import { selectAuthSelected } from '../../store/auth/auth.selectors';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createSpecialty, updateSpecialty } from '../../store/specialties/specialties.api';
import {
  selectSpecialtiesMutationError,
  selectSpecialtiesMutationLoading,
  selectSpecialtiesSelected,
} from '../../store/specialties/specialties.selectors';
import {
  clearSelectedSpecialty,
  clearSpecialtiesMutation,
} from '../../store/specialties/specialties.slice';
import { getRoleRoutePath } from '../../routes/role-routes';
import './Specialty.scss';

export function Specialty() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectAuthSelected);
  const selected = useAppSelector(selectSpecialtiesSelected);
  const mutationLoading = useAppSelector(selectSpecialtiesMutationLoading);
  const mutationError = useAppSelector(selectSpecialtiesMutationError);
  const mode = location.pathname.endsWith('/editar') ? 'edit' : 'create';
  const listPath = user ? getRoleRoutePath(user.role, 'especialidades') : '/admin/administrador/especialidades';
  const form = useSpecialtyForm({ mode, initialValues: selected ?? undefined });
  const { handleSubmit, applyApiFieldErrors, formState: { isSubmitting } } = form;
  const busy = mutationLoading || isSubmitting;

  useEffect(() => {
    if (mode === 'edit' && !selected) navigate(listPath, { replace: true });
  }, [listPath, mode, navigate, selected]);

  useEffect(() => {
    if (mutationError) applyApiFieldErrors(mutationError);
  }, [applyApiFieldErrors, mutationError]);

  const closeForm = () => {
    if (busy) return;
    dispatch(clearSelectedSpecialty());
    dispatch(clearSpecialtiesMutation());
    navigate(listPath);
  };

  const save = async ({ code, ...values }: SpecialtyFormValues) => {
    if (busy) return;
    const result = mode === 'edit' && selected
      ? await dispatch(updateSpecialty({ id: selected.id, ...values }))
      : await dispatch(createSpecialty({ code, ...values }));

    if (createSpecialty.fulfilled.match(result) || updateSpecialty.fulfilled.match(result)) {
      closeForm();
    }
  };

  const submit = handleSubmit(save);

  const mutationSnackbar = useApiError(
    mutationError,
    () => dispatch(clearSpecialtiesMutation()),
    'Não foi possível concluir a operação. Tente novamente.',
  );

  if (mode === 'edit' && !selected) return null;

  return (
    <div className="specialty-page">
      <SpecialtyForm
        mode={mode}
        initialValues={selected ?? undefined}
        fields={form.fields}
        busy={busy}
        onSubmit={() => { void submit(); }}
        onCancel={closeForm}
      />
      <Snackbar {...mutationSnackbar} />
    </div>
  );
}
