import { useEffect, useState } from 'react';

interface SectionDraftPreviewModalProps {
  open: boolean;
  sectionLabel: string;
  initialContent: string;
  complete: boolean;
  missing: string[];
  saving?: boolean;
  onCancel: () => void;
  onSave: (content: string) => void;
}

export function SectionDraftPreviewModal({
  open,
  sectionLabel,
  initialContent,
  complete,
  missing,
  saving = false,
  onCancel,
  onSave,
}: SectionDraftPreviewModalProps) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (open) setContent(initialContent);
  }, [open, initialContent]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="modal-card section-draft-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="section-draft-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="section-draft-title">Prévia: {sectionLabel}</h2>
          <p className="muted">
            Revise o texto gerado a partir do chat. Edite se necessário e salve no documento.
          </p>
        </header>

        {!complete && (
          <p className="section-draft-warning">
            Seção ainda incompleta. Você pode salvar o rascunho e continuar o chat depois.
          </p>
        )}

        {missing.length > 0 && (
          <div className="section-draft-missing">
            <strong>Pendências:</strong>
            <ul>
              {missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <textarea
          className="section-draft-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          aria-label={`Texto da seção ${sectionLabel}`}
        />

        <footer className="modal-actions">
          <button type="button" className="btn secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => onSave(content)}
            disabled={saving || !content.trim()}
          >
            {saving ? 'Salvando…' : 'Salvar no documento'}
          </button>
        </footer>
      </div>
    </div>
  );
}
