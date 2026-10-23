import { useController, type Control, type FieldValues } from 'react-hook-form';

/** Centraliza o controle da role selecionada no cadastro interno. */
export function useRoleForm(control: Control<FieldValues>) {
  const fields = {
    role: useController({
      control,
      name: 'role',
      rules: {
        required: 'Selecione o tipo de usuário.',
      },
    }),
  };

  return { fields };
}
