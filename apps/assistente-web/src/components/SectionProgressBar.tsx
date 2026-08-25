import { DOC_SECTIONS } from '../constants';

export type SectionStatus = 'filled' | 'unsaved' | 'empty';

export function sectionStatus(
  sectionKey: string,
  sectionData: Record<string, string>,
  hasIntakeChat: (key: string) => boolean,
): SectionStatus {
  if (String(sectionData[sectionKey] || '').trim()) return 'filled';
  if (hasIntakeChat(sectionKey)) return 'unsaved';
  return 'empty';
}

export function countFilledSections(sectionData: Record<string, string>) {
  return DOC_SECTIONS.filter((s) => String(sectionData[s.key] || '').trim()).length;
}

interface SectionProgressBarProps {
  sectionData: Record<string, string>;
  hasIntakeChat: (key: string) => boolean;
  activeSection?: string;
  onSectionClick?: (key: string) => void;
}

const STATUS_ICON: Record<SectionStatus, string> = {
  filled: '✓',
  unsaved: '⚠',
  empty: '○',
};

export function SectionProgressBar({
  sectionData,
  hasIntakeChat,
  activeSection,
  onSectionClick,
}: SectionProgressBarProps) {
  const filled = countFilledSections(sectionData);
  const total = DOC_SECTIONS.length;
  const percent = Math.round((filled / total) * 100);

  return (
    <div className="section-progress">
      <div className="section-progress-summary">
        <span className="section-progress-label">
          <strong>{filled}</strong>/{total} seções salvas
        </span>
        <div
          className="section-progress-track"
          role="progressbar"
          aria-valuenow={filled}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${filled} de ${total} seções preenchidas`}
        >
          <div className="section-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="section-progress-percent muted">{percent}%</span>
      </div>
      <div className="section-progress-tabs" role="tablist" aria-label="Seções do documento">
        {DOC_SECTIONS.map((section) => {
          const status = sectionStatus(section.key, sectionData, hasIntakeChat);
          const isActive = activeSection === section.key;
          return (
            <button
              key={section.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              title={`${section.label} — ${status === 'filled' ? 'preenchida' : status === 'unsaved' ? 'chat sem salvar' : 'vazia'}`}
              className={`section-progress-tab section-progress-tab--${status}${isActive ? ' active' : ''}`}
              onClick={() => onSectionClick?.(section.key)}
            >
              <span className="section-progress-icon" aria-hidden="true">{STATUS_ICON[status]}</span>
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
