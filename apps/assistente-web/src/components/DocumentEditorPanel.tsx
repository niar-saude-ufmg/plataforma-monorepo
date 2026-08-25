import { useEffect, useRef } from 'react';
import { DOC_SECTIONS } from '../constants';

interface DocumentEditorPanelProps {
  sectionData: Record<string, string>;
  onSectionChange: (key: string, value: string) => void;
  activeSection?: string;
  onActiveSectionChange?: (key: string) => void;
  embedded?: boolean;
}

export function DocumentEditorPanel({
  sectionData,
  onSectionChange,
  activeSection,
  onActiveSectionChange,
  embedded = false,
}: DocumentEditorPanelProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!activeSection) return;
    const el = sectionRefs.current[activeSection];
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeSection]);

  return (
    <div className="document-editor-panel">
      <div className="document-sheet">
        {!embedded && (
          <header className="document-sheet-header">
            <h1>Documento do Projeto</h1>
            <p className="muted">Edite as seções abaixo. As alterações são salvas automaticamente.</p>
          </header>
        )}
        {embedded && (
          <header className="document-sheet-header embedded">
            <h2>Documento</h2>
          </header>
        )}
        {DOC_SECTIONS.map((section) => (
          <div
            key={section.key}
            ref={(el) => { sectionRefs.current[section.key] = el; }}
            className={`document-section ${activeSection === section.key ? 'active' : ''}`}
          >
            <h2
              className="document-section-title"
              onClick={() => onActiveSectionChange?.(section.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onActiveSectionChange?.(section.key);
              }}
              role="button"
              tabIndex={0}
            >
              {section.label}
            </h2>
            <textarea
              className="document-section-body"
              value={sectionData[section.key] || ''}
              onChange={(e) => onSectionChange(section.key, e.target.value)}
              onFocus={() => onActiveSectionChange?.(section.key)}
              placeholder={`Conteúdo da seção ${section.label}…`}
              rows={6}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
