import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './client';

describe('submitForReview', () => {
  let anchor: HTMLAnchorElement;

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
    global.URL.createObjectURL = vi.fn(() => 'blob:fake');
    global.URL.revokeObjectURL = vi.fn();

    anchor = document.createElement('a');
    vi.spyOn(anchor, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return anchor;
      return Document.prototype.createElement.call(document, tag);
    });
  });

  it('baixa o .docx em caso de sucesso', async () => {
    const mockBlob = new Blob(['docx-content'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    });

    await api.submitForReview(42);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/assistente/projects/42/submit-for-review'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(anchor.download).toBe('projeto_submetido_42.docx');
    expect(anchor.click).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
  });

  it('propaga erro HTTP com detail string', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => JSON.stringify({ detail: 'Script inválido' }),
    });

    await expect(api.submitForReview(42)).rejects.toThrow('Script inválido');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(anchor.click).not.toHaveBeenCalled();
  });

  it('propaga erro HTTP com detail objeto (message + issues)', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () =>
        JSON.stringify({
          detail: {
            message: 'O script contém problemas',
            issues: ['DDL detectado', 'Função perigosa'],
          },
        }),
    });

    await expect(api.submitForReview(42)).rejects.toThrow(
      /O script contém problemas[\s\S]*DDL detectado[\s\S]*Função perigosa/
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(anchor.click).not.toHaveBeenCalled();
  });

  it('mostra mensagem orientativa em erro de rede', async () => {
    (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(api.submitForReview(42)).rejects.toThrow(
      'Não foi possível confirmar a submissão. Verifique o status do projeto antes de tentar novamente.'
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(anchor.click).not.toHaveBeenCalled();
  });
});
