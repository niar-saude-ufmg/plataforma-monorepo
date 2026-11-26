import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ChatBox } from "@mui/x-chat";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { IconButton } from "../IconButton/IconButton";
import { niar } from "../../tokens";
import { chatLocaleText, type ChatLocaleText } from "./Chat.locale";
export type { ChatLocaleText } from "./Chat.locale";
import { createChatAdapter, fromMuiMessage, toMuiMessage } from "./Chat.adapter";
import {
  chatBodyStyles,
  chatBoxStyles,
  chatHeaderStyles,
  chatSurfaceStyles,
} from "./Chat.styles";

export type ChatVariant = "fixed" | "floating";
type ChatFloatingState = "minimized" | "open" | "maximized";
export type ChatMessage = {
  id: number | string;
  role: string;
  content: string;
  created_at?: string;
  channel?: string;
  section_key?: string | null;
};

export type ChatProps = {
  messages?: readonly ChatMessage[];
  onSend: (content: string) => Promise<ChatMessage>;
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onError?: (error: Error) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
  variant?: ChatVariant;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  localeText?: ChatLocaleText;
  roleDisplayNames?: { user?: string; assistant?: string; system?: string };
  "aria-label"?: string;
};

const noMessages: readonly ChatMessage[] = [];

function ChatContent({
  messages = noMessages,
  onSend,
  onMessagesChange,
  onError,
  localeText,
  roleDisplayNames,
  disabled,
}: ChatProps) {
  const incoming = useMemo(() => messages.map((message) => toMuiMessage(message, "chat")), [messages]);
  const [history, setHistory] = useState(incoming);
  const [draft, setDraft] = useState("");
  const lastSent = useRef("");
  const currentValue = draft;
  const currentValueRef = useRef(currentValue);
  currentValueRef.current = currentValue;
  const adapter = useMemo(() => createChatAdapter(async (content) => {
    lastSent.current = content;
    return onSend(content);
  }), [onSend]);

  useEffect(() => setHistory(incoming), [incoming]);

  const changeValue = (next: string) => setDraft(next);

  return (
    <ChatBox
      adapter={adapter}
      messages={history}
      onMessagesChange={(next) => {
        setHistory(next);
        onMessagesChange?.(next.map(fromMuiMessage));
      }}
      initialConversations={[{ id: "chat", title: localeText?.threadLandmarkLabel ?? chatLocaleText.threadLandmarkLabel }]}
      initialActiveConversationId="chat"
      composerValue={currentValue}
      onComposerValueChange={changeValue}
      onError={(error) => {
        if (!currentValueRef.current) changeValue(lastSent.current);
        onError?.(new Error(error.message));
      }}
      slots={{ messageAvatar: null }}
      slotProps={{ composerRoot: { disabled } }}
      variant="default"
      localeText={{
        ...chatLocaleText,
        ...localeText,
      }}
      roleDisplayNames={{
        user: localeText?.messageAuthorUserLabel ?? chatLocaleText.messageAuthorUserLabel,
        assistant: localeText?.messageAuthorAssistantLabel ?? chatLocaleText.messageAuthorAssistantLabel,
        system: localeText?.messageAuthorSystemLabel ?? chatLocaleText.messageAuthorSystemLabel,
        ...roleDisplayNames,
      }}
      features={{ attachments: false, helperText: false, conversationHeader: false, streamingIndicator: true }}
      sx={chatBoxStyles}
    />
  );
}

export function Chat({
  variant = "fixed",
  onMinimize,
  onMaximize,
  onRestore,
  title = "Assistente",
  subtitle,
  localeText,
  roleDisplayNames,
  "aria-label": ariaLabel,
  ...chatProps
}: ChatProps) {
  const [internalState, setInternalState] = useState<ChatFloatingState>("open");
  const state = variant === "floating" ? internalState : "open";
  const minimized = state === "minimized";
  const lastExpanded = useRef<"open" | "maximized">("open");
  const previousState = useRef(state);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const labels = { ...chatLocaleText, ...localeText };

  useEffect(() => {
    if (state !== "minimized") lastExpanded.current = state;
    if (previousState.current === state) return;
    previousState.current = state;
    if (state === "minimized") restoreRef.current?.focus();
    else surfaceRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
  }, [state]);

  const changeState = (next: ChatFloatingState) => {
    setInternalState(next);
    if (next === "minimized") onMinimize?.();
    else if (state === "minimized" || next === "open") onRestore?.();
    else onMaximize?.();
  };

  return (
    <Box
      ref={surfaceRef}
      role="region"
      aria-labelledby={ariaLabel ? undefined : titleId}
      aria-label={ariaLabel}
      sx={chatSurfaceStyles(variant, state)}
    >
      <Box sx={chatHeaderStyles}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id={titleId} component="h2" variant="subtitle1" noWrap>
            {title}
          </Typography>
          {subtitle && !minimized && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {variant === "floating" && (
          <Box sx={{ display: "flex", gap: niar.spacing["2xs"], flexShrink: 0 }}>
            {minimized ? (
              <IconButton
                ref={restoreRef}
                name="expandLess"
                aria-label={labels.restoreChatLabel}
                aria-controls={bodyId}
                aria-expanded={false}
                onClick={() => changeState(lastExpanded.current)}
              />
            ) : (
              <>
                <IconButton
                  name={state === "maximized" ? "closeFullscreen" : "openInFull"}
                  aria-label={state === "maximized" ? labels.restoreChatSizeLabel : labels.maximizeChatLabel}
                  aria-controls={bodyId}
                  onClick={() => changeState(state === "maximized" ? "open" : "maximized")}
                />
                <IconButton
                  name="minimize"
                  aria-label={labels.minimizeChatLabel}
                  aria-controls={bodyId}
                  aria-expanded={true}
                  onClick={() => changeState("minimized")}
                />
              </>
            )}
          </Box>
        )}
      </Box>
      <Box id={bodyId} hidden={minimized} sx={chatBodyStyles}>
        <ChatContent
          {...chatProps}
          localeText={localeText}
          roleDisplayNames={roleDisplayNames}
        />
      </Box>
    </Box>
  );
}
