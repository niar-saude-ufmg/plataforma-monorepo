import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NiarProvider } from "../../theme";
import { Chat, type ChatMessage, type ChatProps } from "./Chat";

const messages: ChatMessage[] = [{ id: 10, role: "assistant", content: "Qual problema você pretende investigar?", created_at: "2026-11-26T12:00:00Z", channel: "intake", section_key: "background" }];
const reply: ChatMessage = { id: 12, role: "assistant", content: "Vamos organizar o contexto da pesquisa.", channel: "intake", section_key: "background" };

function renderChat(props: Partial<ChatProps> = {}) {
  return render(<NiarProvider><Chat messages={messages} onSend={async () => reply} {...props} /></NiarProvider>);
}

beforeEach(() => {
  // JSDOM não implementa a API de medição usada pelo histórico virtualizado.
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("Chat", () => {
  it("renderiza mensagens no formato da API e identifica o contexto integrado", () => {
    renderChat({ title: "Assistente do projeto", subtitle: "Seção: Contexto" });
    expect(screen.getByRole("region", { name: "Assistente do projeto" })).toBeVisible();
    expect(screen.getByText("Seção: Contexto")).toBeVisible();
    expect(screen.getByText(messages[0].content)).toBeVisible();
    expect(screen.getByRole("region", { name: "Assistente do projeto" }).querySelector(".MuiAvatar-root")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Minimizar chat" })).not.toBeInTheDocument();
  });

  it("bloqueia envio vazio, envia content sem espaços externos e exibe o JSON de resposta", async () => {
    const onSend = vi.fn(async () => reply);
    renderChat({ onSend });
    expect(screen.getByRole("button", { name: "Enviar mensagem" })).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name: "Mensagem" }), { target: { value: "  Meu projeto  " } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    await waitFor(() => expect(onSend).toHaveBeenCalledWith("Meu projeto"));
    expect(await screen.findByText(reply.content)).toBeVisible();
  });

  it("preserva histórico, rascunho e foco ao minimizar e restaurar", () => {
    renderChat({ variant: "floating" });
    fireEvent.change(screen.getByRole("textbox", { name: "Mensagem" }), { target: { value: "Ainda estou escrevendo" } });
    fireEvent.click(screen.getByRole("button", { name: "Minimizar chat" }));
    expect(screen.queryByRole("textbox", { name: "Mensagem" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restaurar chat" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Restaurar chat" }));
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("Ainda estou escrevendo");
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveFocus();
    expect(screen.getByText(messages[0].content)).toBeVisible();
  });

  it("maximiza e restaura mantendo a composição", () => {
    const onMaximize = vi.fn();
    const onRestore = vi.fn();
    renderChat({ variant: "floating", onMaximize, onRestore });
    fireEvent.change(screen.getByRole("textbox", { name: "Mensagem" }), { target: { value: "Meu rascunho" } });
    fireEvent.click(screen.getByRole("button", { name: "Maximizar chat" }));
    expect(onMaximize).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Restaurar tamanho do chat" }));
    expect(onRestore).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("Meu rascunho");
  });

  it("notifica minimizar e restaurar com estado interno", () => {
    const onMinimize = vi.fn();
    const onRestore = vi.fn();
    renderChat({ variant: "floating", onMinimize, onRestore });
    fireEvent.click(screen.getByRole("button", { name: "Minimizar chat" }));
    expect(onMinimize).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Restaurar chat" }));
    expect(onRestore).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toBeVisible();
  });

  it("traduz controles, nomes acessíveis e papéis sem alterar os valores das mensagens", () => {
    renderChat({ variant: "floating", "aria-label": "Research chat", roleDisplayNames: { assistant: "Research assistant" }, localeText: { composerInputAriaLabel: "Message", composerSendButtonLabel: "Send", minimizeChatLabel: "Minimize", maximizeChatLabel: "Maximize" } });
    expect(screen.getByRole("region", { name: "Research chat" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Message" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Minimize" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Maximize" })).toBeVisible();
    expect(screen.getByText("Research assistant")).toBeVisible();
  });

  it("preserva a mensagem após erro e permite tentar novamente", async () => {
    const onSend = vi.fn().mockRejectedValueOnce(new Error("Sem conexão")).mockResolvedValueOnce(reply);
    renderChat({ onSend });
    fireEvent.change(screen.getByRole("textbox", { name: "Mensagem" }), { target: { value: "Meu objetivo" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("Meu objetivo"));
    fireEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText(reply.content)).toBeVisible();
    expect(onSend).toHaveBeenCalledTimes(2);
  });

  it("atualiza o histórico fornecido e isola uma nova conversa", async () => {
    const onSend = async () => reply;
    const { rerender } = renderChat({ onSend });
    fireEvent.change(screen.getByRole("textbox", { name: "Mensagem" }), { target: { value: "Rascunho de contexto" } });
    rerender(<NiarProvider><Chat key="objetivos" messages={[{ id: 20, role: "assistant", content: "Qual é seu objetivo?" }]} onSend={onSend} /></NiarProvider>);
    expect(await screen.findByText("Qual é seu objetivo?")).toBeVisible();
    expect(screen.queryByText(messages[0].content)).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveValue("");
  });

  it("impede envios quando desabilitado", () => {
    const onSend = vi.fn();
    const { rerender } = renderChat({ onSend });
    fireEvent.change(screen.getByRole("textbox", { name: "Mensagem" }), { target: { value: "Mensagem pronta para envio" } });
    rerender(<NiarProvider><Chat messages={messages} disabled onSend={onSend} /></NiarProvider>);
    expect(screen.getByRole("button", { name: "Enviar mensagem" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Mensagem" }), { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("bloqueia outra submissão enquanto a API ainda não respondeu", async () => {
    let finish: ((value: ChatMessage) => void) | undefined;
    const onSend = vi.fn(() => new Promise<ChatMessage>((resolve) => { finish = resolve; }));
    renderChat({ onSend });
    fireEvent.change(screen.getByRole("textbox", { name: "Mensagem" }), { target: { value: "Meu projeto" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    await waitFor(() => expect(onSend).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: "Enviar mensagem" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Mensagem" }), { key: "Enter" });
    expect(onSend).toHaveBeenCalledOnce();
    finish?.(reply);
    expect(await screen.findByText(reply.content)).toBeVisible();
  });

  it("mantém o histórico de uma mesma conversa atualizado pela API", async () => {
    const onSend = async () => reply;
    const { rerender } = renderChat({ onSend });
    rerender(<NiarProvider><Chat messages={[...messages, reply]} onSend={onSend} /></NiarProvider>);
    expect(await screen.findByText(reply.content)).toBeVisible();
    expect(screen.getByText(messages[0].content)).toBeVisible();
  });

  it("usa a tradução do placeholder", () => {
    renderChat({ localeText: { composerInputPlaceholder: "Converse sobre Contexto" } });
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toHaveAttribute("placeholder", "Converse sobre Contexto");
  });
});
