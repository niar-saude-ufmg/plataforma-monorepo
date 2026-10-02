import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useNiarForm } from './use-niar-form';

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.'),
});

function FormHarness({ onSubmit }: { onSubmit: (values: { name: string }) => void }) {
  const form = useNiarForm({
    schema,
    defaultValues: { name: 'Nome inicial' },
  });

  return (
    <>
      <input aria-label="Nome" {...form.register('name')} />
      {form.formState.errors.name?.message ? (
        <span role="alert">{form.formState.errors.name.message}</span>
      ) : null}
      <button onClick={() => void form.handleSubmit(onSubmit)()}>Salvar</button>
    </>
  );
}

describe('useNiarForm', () => {
  afterEach(cleanup);

  it('aplica os valores padrão e encaminha os valores validados', async () => {
    const onSubmit = vi.fn();
    render(<FormHarness onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Nome')).toHaveValue('Nome inicial');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Nome inicial' }, undefined);
  });

  it('expõe erros do schema quando a validação falha', async () => {
    const onSubmit = vi.fn();
    render(<FormHarness onSubmit={onSubmit} />);
    const user = userEvent.setup();

    await user.clear(screen.getByLabelText('Nome'));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome.');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
