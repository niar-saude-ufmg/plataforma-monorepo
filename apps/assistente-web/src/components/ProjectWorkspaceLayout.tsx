import { ReactNode, useEffect, useState } from 'react';
import { WizardSession } from '../api/client';
import { AdvisoryChatPanel } from './AdvisoryChatPanel';
import { DocumentEditorPanel } from './DocumentEditorPanel';

const ADVISORY_OPEN_KEY = 'hra-advisory-panel-open';

function advisoryMessages(session: WizardSession) {
  return session.messages
    .filter((m) => (m.channel ?? 'intake') === 'advisory')
    .sort((a, b) => a.id - b.id);
}

function AiFabIcon() {
  return (
    <svg className="ai-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2l1.2 4.2L17.5 7.5 13.2 8.7 12 13l-1.2-4.3L6.5 7.5l4.3-1.3L12 2zm7 7l.8 2.8L22.5 13l-2.7.8L19 16.5l-.8-2.7L15.5 13l2.7-.8L19 9zm-14 0l.8 2.8L8.5 13l-2.7.8L7 16.5l-.8-2.7L3.5 13l2.7-.8L5 9zm7 5l1.2 4.2L17.5 18.5l-4.3 1.3L12 24l-1.2-4.2L6.5 18.5l4.3-1.3L12 14z"
      />
    </svg>
  );
}

interface ProjectWorkspaceLayoutProps {
  session: WizardSession;
  activeSection: string;
  onActiveSectionChange: (key: string) => void;
  onSectionChange: (key: string, value: string) => void;
  onAdvisorySend: (content: string) => Promise<void>;
  saveStatus?: string;
  children: ReactNode;
}

export function ProjectWorkspaceLayout({
  session,
  activeSection,
  onActiveSectionChange,
  onSectionChange,
  onAdvisorySend,
  saveStatus,
  children,
}: ProjectWorkspaceLayoutProps) {
  const [advisoryOpen, setAdvisoryOpen] = useState(() => {
    const stored = localStorage.getItem(ADVISORY_OPEN_KEY);
    return stored !== 'false';
  });

  useEffect(() => {
    localStorage.setItem(ADVISORY_OPEN_KEY, String(advisoryOpen));
  }, [advisoryOpen]);

  return (
    <div className={`project-workspace-layout ${advisoryOpen ? '' : 'advisory-collapsed'}`}>
      {advisoryOpen ? (
        <aside className="project-workspace-col project-workspace-advisory">
          <AdvisoryChatPanel
            messages={advisoryMessages(session)}
            onSend={onAdvisorySend}
            onHide={() => setAdvisoryOpen(false)}
          />
        </aside>
      ) : (
        <button
          type="button"
          className="advisory-fab"
          onClick={() => setAdvisoryOpen(true)}
          title="Abrir assistente consultivo"
          aria-label="Abrir assistente consultivo"
        >
          <AiFabIcon />
          <span>IA</span>
        </button>
      )}
      <main className="project-workspace-col project-workspace-center">
        {children}
      </main>
      <aside className="project-workspace-col project-workspace-document">
        {saveStatus && <p className="document-save-hint muted">{saveStatus}</p>}
        <DocumentEditorPanel
          embedded
          sectionData={session.section_data}
          onSectionChange={onSectionChange}
          activeSection={activeSection}
          onActiveSectionChange={onActiveSectionChange}
        />
      </aside>
    </div>
  );
}
