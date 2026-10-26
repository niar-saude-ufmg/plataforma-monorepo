import { useController, type Control, type FieldValues } from 'react-hook-form';

/** Centraliza os controllers exclusivos do cadastro de pesquisador. */
export function useResearcherForm(control: Control<FieldValues>) {
  const fields = {
    phone: useController({ control, name: 'phone' }),
    institution: useController({ control, name: 'institution' }),
    organizationalUnit: useController({ control, name: 'organizationalUnit' }),
    contactAddress: useController({ control, name: 'contactAddress' }),
    researchArea: useController({ control, name: 'researchArea' }),
    position: useController({ control, name: 'position' }),
    caae: useController({ control, name: 'caae' }),
    opinionNumber: useController({ control, name: 'opinionNumber' }),
    approvalDate: useController({ control, name: 'approvalDate' }),
    coepDocument: useController({ control, name: 'coepDocument' }),
  };

  return { fields };
}
