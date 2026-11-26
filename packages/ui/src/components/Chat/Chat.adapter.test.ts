import { describe, expect, it, vi } from "vitest";
import { createChatAdapter, fromMuiMessage, toMuiMessage } from "./Chat.adapter";
import type { ChatMessage } from "./Chat";

const message: ChatMessage = { id: 42, role: "assistant", content: "Contexto do projeto", channel: "intake", section_key: "background", created_at: "2026-11-26T12:00:00Z" };

describe("adaptação interna do Chat", () => {
  it("converte o histórico sem perder IDs numéricos e contexto da API", () => {
    const converted = toMuiMessage(message, "project:1:background");
    expect(converted.parts).toEqual([{ type: "text", text: message.content }]);
    expect(converted.conversationId).toBe("project:1:background");
    expect(fromMuiMessage(converted)).toEqual(message);
  });

  it("adapta uma resposta JSON completa sem exigir streaming do consumidor", async () => {
    const onSend = vi.fn(async () => message);
    const controller = new AbortController();
    const outgoing = toMuiMessage({ id: "temporario", role: "user", content: "  Meu projeto  " }, "chat");
    const stream = await createChatAdapter(onSend).sendMessage({ message: outgoing, messages: [outgoing], signal: controller.signal });
    const reader = stream.getReader();
    const chunks = [];
    for (let next = await reader.read(); !next.done; next = await reader.read()) chunks.push(next.value);
    expect(onSend).toHaveBeenCalledWith("Meu projeto");
    expect(chunks).toContainEqual({ type: "start", messageId: "42" });
    expect(chunks).toContainEqual({ type: "text-delta", id: "42-text", delta: message.content });
    expect(chunks).toContainEqual({ type: "finish", messageId: "42" });
  });

  it("descarta a resposta de uma conversa já desmontada sem enviá-la à nova", async () => {
    const controller = new AbortController();
    const outgoing = toMuiMessage({ id: 1, role: "user", content: "Minha seção" }, "chat");
    const onSend = vi.fn(async () => { controller.abort(); return message; });
    await expect(createChatAdapter(onSend).sendMessage({ message: outgoing, messages: [outgoing], signal: controller.signal })).rejects.toBeDefined();
  });
});
