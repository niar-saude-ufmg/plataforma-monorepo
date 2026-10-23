import { NiarProvider } from '@niar/ui';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { specialtiesReducer } from '../../store/specialties/specialties.slice';
import { SpecialtyForm } from './SpecialtyForm';

describe('SpecialtyForm', () => {
  it('valida limites do contrato e envia os valores válidos normalizados', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const cancel = vi.fn();
    const store = configureStore({ reducer: { specialties: specialtiesReducer } });
    render(
      <NiarProvider><Provider store={store}>
        <SpecialtyForm mode="create" onSubmit={submit} onCancel={cancel} />
      </Provider></NiarProvider>,
    );
    const user = userEvent.setup();
    for (const [label, value] of [
      [/Código/, 'a'.repeat(101)], [/Nome/, 'b'.repeat(256)],
      ['Descrição', 'c'.repeat(2001)], ['Contexto de orientação', 'd'.repeat(4001)],
    ] as const) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(await screen.findByText('Use até 100 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Use até 255 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Use até 2000 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Use até 4000 caracteres.')).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Código/), { target: { value: ' epi ' } });
    fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: ' Epidemiologia ' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Contexto de orientação'), { target: { value: '' } });
    await user.click(screen.getByRole('button', { name: 'Cadastrar' }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ code: 'epi', name: 'Epidemiologia', description: '', guidanceContext: '' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(cancel).toHaveBeenCalledOnce();
  });
});
