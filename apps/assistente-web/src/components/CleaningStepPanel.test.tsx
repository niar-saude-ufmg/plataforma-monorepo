import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

const mocks = vi.hoisted(() => ({
  submitForReviewRequest: vi.fn(),
  getCleaningRequest: vi.fn(),
  listDatasetsRequest: vi.fn(),
  getSchemaRequest: vi.fn(),
  listCleaningVersionsRequest: vi.fn(),
  downloadFile: vi.fn(),
}));

vi.mock('../services/projects/projects.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/projects/projects.service')>()),
  submitForReviewRequest: mocks.submitForReviewRequest,
}));
vi.mock('../services/cleaning/cleaning.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/cleaning/cleaning.service')>()),
  getCleaningRequest: mocks.getCleaningRequest,
  listCleaningVersionsRequest: mocks.listCleaningVersionsRequest,
}));
vi.mock('../services/datasets/datasets.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/datasets/datasets.service')>()),
  listDatasetsRequest: mocks.listDatasetsRequest,
  getSchemaRequest: mocks.getSchemaRequest,
}));
vi.mock('../services/http', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/http')>()),
  downloadFile: mocks.downloadFile,
}));

import { store } from '../store';
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
    <Provider store={store}>
      <CleaningStepPanel
        session={session}
        projectId={props.projectId ?? 42}
        onSessionChange={onSessionChange}
        onError={onError}
        onSaveMessage={onSaveMessage}
      />
    </Provider>
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
    mocks.listDatasetsRequest.mockResolvedValue([]);
    mocks.listCleaningVersionsRequest.mockResolvedValue([]);
    mocks.getSchemaRequest.mockResolvedValue({ tables: [] });
  });

  it('submissão bem-sucedida mostra mensagem de sucesso e atualiza a sessão', async () => {
    mocks.submitForReviewRequest.mockResolvedValueOnce({ blob: new Blob(), filename: 'projeto.docx' });
    const updatedSession = makeSession({ current_step: 'export' });
    mocks.getCleaningRequest.mockResolvedValueOnce(updatedSession);

    const { onSaveMessage, onError, onSessionChange } = renderPanel();

    await userEvent.click(screen.getByRole('button', { name: /enviar para avaliação/i }));

    await waitFor(() => {
      expect(mocks.submitForReviewRequest).toHaveBeenCalledWith(42);
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
    mocks.submitForReviewRequest.mockResolvedValueOnce({ blob: new Blob(), filename: 'projeto.docx' });
    mocks.getCleaningRequest.mockRejectedValueOnce(new Error('timeout de rede'));

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
    mocks.submitForReviewRequest.mockRejectedValueOnce(
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
    mocks.submitForReviewRequest.mockReturnValueOnce(submitPromise);
    mocks.getCleaningRequest.mockResolvedValueOnce(makeSession());

    const { onError } = renderPanel();
    const button = screen.getByRole('button', { name: /enviar para avaliação/i });

    // Clica duas vezes rapidamente
    await userEvent.click(button);
    await userEvent.click(button);

    expect(mocks.submitForReviewRequest).toHaveBeenCalledTimes(1);

    resolveSubmit!();
    await waitFor(() => {
      expectNoRealError(onError);
    });
  });
});
