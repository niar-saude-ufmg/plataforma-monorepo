import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../../../types/user.types';
import { useProfileForm } from './use-profile-form';

const user: AuthUser = {
  id: 1,
  name: 'Gestora Um',
  email: 'gestora@niar.local',
  role: 'admin',
  accountStatus: 'active',
};

function ProfileFormHarness({ onSubmit }: { onSubmit: (values: unknown) => void }) {
  const form = useProfileForm({
    user,
    fields: {
      fullName: { visible: true, editable: true },
      email: { visible: true, editable: true },
      phone: { visible: false, editable: false },
    },
  });

  return (
    <>
      <input aria-label="Nome completo" {...form.fields.fullName} />
      <input aria-label="E-mail" {...form.fields.email} />
      <button onClick={() => void form.handleSubmit(onSubmit)()}>Salvar</button>
    </>
  );
}

describe('useProfileForm', () => {
  afterEach(cleanup);

  it('cria os campos controlados a partir do usuário autenticado', () => {
    render(<ProfileFormHarness onSubmit={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: 'Nome completo' })).toHaveValue('Gestora Um');
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue('gestora@niar.local');
  });

  it('valida os campos antes de encaminhar o submit', async () => {
    const onSubmit = vi.fn();
    render(<ProfileFormHarness onSubmit={onSubmit} />);
    const formUser = userEvent.setup();

    await formUser.clear(screen.getByRole('textbox', { name: 'E-mail' }));
    await formUser.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
