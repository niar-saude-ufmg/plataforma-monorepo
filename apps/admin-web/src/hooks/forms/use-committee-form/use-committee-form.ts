import { useController, type Control, type FieldValues } from 'react-hook-form';

/** Centraliza os controllers exclusivos do cadastro de membro do comitê. */
export function useCommitteeForm(control: Control<FieldValues>) {
  const fields = {
    specialtyId: useController({ control, name: 'specialtyId' }),
  };

  return { fields };
}
