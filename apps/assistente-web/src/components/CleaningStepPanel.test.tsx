import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../api/client', async () => {
  const actual = await vi.importActual<typeof import('../api/client')>('../api/client');
  return {
    ...actual,
    api: {
      ...actual.api,
      submitForReview: vi.fn(),
      getCleaning: vi.fn(),
      listDatasets: vi.fn().mockResolvedValue([]),
      listCleaningVersions: vi.fn().mockResolvedValue([]),
      getSchema: vi.fn(),
      updateCleaning: vi.fn(),
    },
  };
});

import { api } from '../api/client';
import { CleaningStepPanel } from './CleaningStepPanel';

function makeSession(overrides: Partial<any> = {}) {
  return {
    id: 10,
    project_id: 42,
    current_step: 'export',
    dataset_id: 1,
    linked_project_id: 42,
    script_content: 'print("ok")',
    validation_result: { valid: true, syntax_ok: true, safety_ok: true, lint_ok: true, issues: [] },
    messages: [],
    ...overrides,
  } as any;
}

function renderPanel(props: Partial<React.ComponentProps<typeof CleaningStepPanel>> = {}) {
  const onSessionChange = vi.fn();
  const onError = vi.fn();
  const onSaveMessage = vi.fn();

  const session = props.session ?? makeSession();

  render(
    <CleaningStepPanel
      session={session}
      projectId={props.projectId ?? 42}
      onSessionChange={onSessionChange}
      onError={onError}
      onSaveMessage={onSaveMessage}
    />
  );

  return { onSessionChange, onError, onSaveMessage };
}

function expectNoRealError(onError: ReturnType<typeof vi.fn>) {
  const realErrors = onError.mock.calls
    .map(([msg]) => msg)
    .filter((msg) => typeof msg === 'string' && msg.length > 0);
  expect(realErrors).toEqual([]);
}

describe('CleaningStepPanel::submitForReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submissão bem-sucedida mostra mensagem de sucesso e atualiza a sessão', async () => {
    (api.submitForReview as any).mockResolvedValueOnce(undefined);
    const updatedSession = makeSession({ current_step: 'export' });
    (api.getCleaning as any).mockResolvedValueOnce(updatedSession);

    const { onSaveMessage, onError, onSessionChange } = renderPanel();

    await userEvent.click(screen.getByRole('button', { name: /enviar para avaliação/i }));

    await waitFor(() => {
      expect(api.submitForReview).toHaveBeenCalledWith(42);
    });
    await waitFor(() => {
      expect(onSaveMessage).toHaveBeenCalledWith(
        'Projeto enviado para avaliação. O documento foi baixado no seu computador.'
      );
    });
    expectNoRealError(onError);
    expect(onSessionChange).toHaveBeenCalledWith(updatedSession);
  });

  it('se getCleaning falhar após submit OK, ainda mostra sucesso', async () => {
    (api.submitForReview as any).mockResolvedValueOnce(undefined);
    (api.getCleaning as any).mockRejectedValueOnce(new Error('timeout de rede'));

    const { onSaveMessage, onError } = renderPanel();

    await userEvent.click(screen.getByRole('button', { name: /enviar para avaliação/i }));

    await waitFor(() => {
      expect(onSaveMessage).toHaveBeenCalledWith(
        'Projeto enviado para avaliação. O documento foi baixado no seu computador.'
      );
    });
    expectNoRealError(onError);
  });

  it('erro na submissão mostra mensagem de erro e limpa a de sucesso', async () => {
    (api.submitForReview as any).mockRejectedValueOnce(
      new Error('Não foi possível confirmar a submissão. Verifique o status do projeto antes de tentar novamente.')
    );

    const { onError, onSaveMessage } = renderPanel();

    await userEvent.click(screen.getByRole('button', { name: /enviar para avaliação/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        'Não foi possível confirmar a submissão. Verifique o status do projeto antes de tentar novamente.'
      );
    });
    expect(onSaveMessage).toHaveBeenCalledWith('');
  });

  it('prevenção de duplo envio: cliques rápidos só disparam um fetch', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((r) => { resolveSubmit = r; });
    (api.submitForReview as any).mockReturnValueOnce(submitPromise);
    (api.getCleaning as any).mockResolvedValueOnce(makeSession());

    const { onError } = renderPanel();
    const button = screen.getByRole('button', { name: /enviar para avaliação/i });

    // Clica duas vezes rapidamente
    await userEvent.click(button);
    await userEvent.click(button);

    expect(api.submitForReview).toHaveBeenCalledTimes(1);

    resolveSubmit!();
    await waitFor(() => {
      expectNoRealError(onError);
    });
  });
});
