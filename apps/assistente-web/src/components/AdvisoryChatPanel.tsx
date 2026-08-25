import { ChatPanel } from './ChatPanel';

interface AdvisoryMessage {
  id?: number;
  role: string;
  content: string;
  channel?: string;
}

interface AdvisoryChatPanelProps {
  messages: AdvisoryMessage[];
  onSend: (content: string) => Promise<void>;
  onHide?: () => void;
}

function AiIcon() {
  return (
    <svg className="ai-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2l1.2 4.2L17.5 7.5 13.2 8.7 12 13l-1.2-4.3L6.5 7.5l4.3-1.3L12 2zm7 7l.8 2.8L22.5 13l-2.7.8L19 16.5l-.8-2.7L15.5 13l2.7-.8L19 9zm-14 0l.8 2.8L8.5 13l-2.7.8L7 16.5l-.8-2.7L3.5 13l2.7-.8L5 9zm7 5l1.2 4.2L17.5 18.5l-4.3 1.3L12 24l-1.2-4.2L6.5 18.5l4.3-1.3L12 14z"
      />
    </svg>
  );
}

export function AdvisoryChatPanel({ messages, onSend, onHide }: AdvisoryChatPanelProps) {
  return (
    <div className="advisory-chat-panel">
      <div className="advisory-chat-intro">
        <div className="advisory-chat-intro-header">
          <h2>
            <AiIcon />
            Assistente consultivo
          </h2>
          {onHide && (
            <button
              type="button"
              className="advisory-hide-btn"
              onClick={onHide}
              title="Ocultar assistente consultivo"
              aria-label="Ocultar assistente consultivo"
            >
              ‹
            </button>
          )}
        </div>
        <p className="muted">
          Tire dúvidas sobre modelos, métricas, validação e interpretação. Este chat é independente
          da coleta guiada e não altera o documento automaticamente.
        </p>
      </div>
      <ChatPanel
        messages={messages}
        onSend={onSend}
        placeholder="Pergunte sobre modelagem, avaliação, métricas, viés ou boas práticas…"
      />
    </div>
  );
}
