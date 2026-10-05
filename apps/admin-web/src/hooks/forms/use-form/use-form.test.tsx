import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useForm } from './use-form';

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.'),
});

function FormHarness({ onSubmit }: { onSubmit: (values: { name: string }) => void }) {
  const form = useForm({
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

function ApiErrorHarness() {
  const form = useForm({
    schema,
    defaultValues: { name: '' },
  });

  return (
    <>
      <input aria-label="Nome" {...form.register('name')} />
      {form.fieldError('name') ? <span role="alert">{form.fieldError('name')}</span> : null}
      {form.formState.errors.root?.message ? <span>{form.formState.errors.root.message}</span> : null}
      <button
        onClick={() => form.applyApiFieldErrors({
          message: 'Revise os dados.',
          fieldErrors: { name: 'Nome já utilizado.' },
        })}
      >
        Aplicar erro
      </button>
    </>
  );
}

describe('useForm', () => {
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

  it('distribui erros de validação da API para o campo', async () => {
    render(<ApiErrorHarness />);

    // A mensagem geral da API pertence ao estado da requisição no Redux.
    // O formulário só recebe os erros específicos dos campos.
    await userEvent.setup().click(screen.getByRole('button', { name: 'Aplicar erro' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Nome já utilizado.');
  });
});
