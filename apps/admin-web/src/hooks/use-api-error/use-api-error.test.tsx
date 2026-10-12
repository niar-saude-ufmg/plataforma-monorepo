import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useApiError } from './use-api-error';

function Harness({ error }: { error: unknown }) {
  const onClose = vi.fn();
  const snackbar = useApiError(
    error,
    onClose,
    'Não foi possível concluir a operação.',
  );

  return (
    <div
      data-testid="snackbar-props"
      data-open={String(snackbar.open)}
      data-message={snackbar.message}
      data-severity={snackbar.severity}
      onClick={() => snackbar.onClose?.(new Event('close'), 'timeout')}
    />
  );
}

describe('useApiError', () => {
  afterEach(cleanup);

  it('prepara as props do Snackbar para um erro da API', () => {
    render(<Harness error={{ message: 'Falha ao carregar usuários.' }} />);

    const props = screen.getByTestId('snackbar-props');

    expect(props).toHaveAttribute('data-open', 'true');
    expect(props).toHaveAttribute('data-message', 'Falha ao carregar usuários.');
    expect(props).toHaveAttribute('data-severity', 'error');
  });

  it('usa o fallback quando o erro não possui mensagem', () => {
    render(<Harness error={{ status: 500 }} />);

    expect(screen.getByTestId('snackbar-props')).toHaveAttribute(
      'data-message',
      'Não foi possível concluir a operação.',
    );
  });

  it('mantém o Snackbar fechado sem erro', () => {
    render(<Harness error={null} />);

    const props = screen.getByTestId('snackbar-props');

    expect(props).toHaveAttribute('data-open', 'false');
    expect(props).toHaveAttribute('data-message', '');
  });
});
