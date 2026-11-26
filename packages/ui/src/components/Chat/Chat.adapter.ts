import type { ChatBoxProps } from "@mui/x-chat";
import type { ChatMessage, ChatProps } from "./Chat";

type MuiMessage = NonNullable<ChatBoxProps["messages"]>[number];
type MuiAdapter = ChatBoxProps["adapter"];

export function toMuiMessage(message: ChatMessage, conversationId: string): MuiMessage {
  return {
    id: String(message.id),
    role: message.role === "user" || message.role === "system" ? message.role : "assistant",
    conversationId,
    createdAt: message.created_at,
    status: "sent",
    parts: [{ type: "text", text: message.content }],
    metadata: {
      sourceId: message.id,
      channel: message.channel,
      section_key: message.section_key,
      created_at: message.created_at,
    },
  };
}

export function fromMuiMessage(message: MuiMessage): ChatMessage {
  const metadata: Record<string, unknown> = { ...message.metadata };
  const sourceId = metadata.sourceId;
  const channel = metadata.channel;
  const section = metadata.section_key;
  const createdAt = metadata.created_at;
  return {
    id: typeof sourceId === "number" || typeof sourceId === "string" ? sourceId : message.id,
    role: message.role,
    content: message.parts.map((part) => part.type === "text" ? part.text : "").join(""),
    created_at: typeof createdAt === "string" ? createdAt : message.createdAt,
    channel: typeof channel === "string" ? channel : undefined,
    section_key: typeof section === "string" || section === null ? section : undefined,
  };
}

/** A API atual retorna JSON completo; o protocolo do MUI fica restrito ao DS. */
export function createChatAdapter(onSend: ChatProps["onSend"]): MuiAdapter {
  return {
    async sendMessage({ message, signal }) {
      const content = message.parts.map((part) => part.type === "text" ? part.text : "").join("").trim();
      signal.throwIfAborted();
      const reply = await onSend(content);
      signal.throwIfAborted();
      const messageId = String(reply.id);
      const partId = `${messageId}-text`;
      return new ReadableStream({
        start(controller) {
          controller.enqueue({ type: "start", messageId });
          controller.enqueue({
            type: "message-metadata",
            metadata: {
              sourceId: reply.id,
              channel: reply.channel,
              section_key: reply.section_key,
              created_at: reply.created_at,
            },
          });
          controller.enqueue({ type: "text-start", id: partId });
          controller.enqueue({ type: "text-delta", id: partId, delta: reply.content });
          controller.enqueue({ type: "text-end", id: partId });
          controller.enqueue({ type: "finish", messageId });
          controller.close();
        },
      });
    },
  };
}
