import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submitForReviewRequest } from './projects.service';

describe('submitForReviewRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('retorna o arquivo .docx em caso de sucesso', async () => {
    (global.fetch as any).mockResolvedValueOnce(new Response('docx-content', { status: 200 }));

    const result = await submitForReviewRequest(42);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/assistente/projects/42/submit-for-review'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.filename).toBe('projeto_submetido_42.docx');
    expect(await result.blob.text()).toBe('docx-content');
  });

  it('propaga erro HTTP com detail string', async () => {
    (global.fetch as any).mockResolvedValueOnce(new Response(
      JSON.stringify({ detail: 'Script inválido' }),
      { status: 400 },
    ));

    await expect(submitForReviewRequest(42)).rejects.toMatchObject({ message: 'Script inválido' });
  });

  it('preserva message e issues do erro HTTP', async () => {
    (global.fetch as any).mockResolvedValueOnce(new Response(
      JSON.stringify({ detail: { message: 'O script contém problemas', issues: ['DDL detectado', 'Função perigosa'] } }),
      { status: 400 },
    ));

    await expect(submitForReviewRequest(42)).rejects.toMatchObject({
      message: expect.stringMatching(/O script contém problemas[\s\S]*DDL detectado[\s\S]*Função perigosa/),
    });
  });

  it('mantém a mensagem orientativa em erro de rede', async () => {
    (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(submitForReviewRequest(42)).rejects.toMatchObject({
      message: 'Não foi possível confirmar a submissão. Verifique o status do projeto antes de tentar novamente.',
    });
  });
});
