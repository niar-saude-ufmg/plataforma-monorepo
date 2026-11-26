import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";

import { niar } from "../../tokens";
import { Chat, type ChatMessage, type ChatProps } from "./Chat";

const messages: ChatMessage[] = [
  { id: 1, role: "assistant", content: "Vamos escrever o contexto do projeto. Qual problema sua pesquisa pretende investigar?", channel: "intake", section_key: "background" },
  { id: 2, role: "user", content: "Queremos investigar os fatores associados ao diagnóstico tardio de doenças cardiovasculares.", channel: "intake", section_key: "background" },
  { id: 3, role: "assistant", content: "Podemos organizar o contexto em três pontos:\n\n1. O problema clínico.\n2. A população estudada.\n3. A contribuição esperada da pesquisa.", channel: "intake", section_key: "background" },
];

async function sendDemoMessage(content: string): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { id: crypto.randomUUID(), role: "assistant", content: `Podemos desenvolver essa ideia: ${content}`, channel: "intake", section_key: "background", created_at: new Date().toISOString() };
}

const meta = {
  title: "Componentes/Chat",
  component: Chat,
  args: { variant: "fixed", title: "Assistente do projeto", subtitle: "Seção: Contexto", messages, onSend: sendDemoMessage },
  argTypes: {
    variant: { control: "select", options: ["fixed", "floating"], description: "Apresentação fixa no layout ou flutuante no canto da tela.", table: { category: "PROPS", type: { summary: "ChatVariant" }, defaultValue: { summary: "fixed" } } },
    title: { control: "text", description: "Título que identifica a conversa.", table: { category: "PROPS", type: { summary: "string" }, defaultValue: { summary: "Assistente" } } },
    subtitle: { control: "text", description: "Contexto opcional, como a seção selecionada.", table: { category: "PROPS", type: { summary: "string" } } },
    messages: { control: "object", description: "Histórico no formato da API. Consulte a estrutura ChatMessage abaixo.", table: { category: "PROPS", type: { summary: "readonly ChatMessage[]" }, defaultValue: { summary: "[]" } } },
    disabled: { control: "boolean", description: "Desabilita a composição e o envio de mensagens.", table: { category: "PROPS", type: { summary: "boolean" }, defaultValue: { summary: "false" } } },
    localeText: { control: "object", description: "Traduções parciais dos textos e nomes acessíveis. Consulte a estrutura abaixo.", table: { category: "PROPS", type: { summary: "ChatLocaleText" }, defaultValue: { summary: "Português" } } },
    roleDisplayNames: { control: "object", description: "Nomes exibidos para os papéis, sem modificar os valores das mensagens.", table: { category: "PROPS", type: { summary: "{ user?: string; assistant?: string; system?: string }" } } },
    "aria-label": { control: "text", description: "Nome acessível da região; quando omitido, utiliza o título.", table: { category: "ACCESSIBILITY", type: { summary: "string" } } },
    onSend: { control: false, description: "Recebe o texto e retorna a mensagem do assistente. Rejeite a Promise para exibir a falha e permitir nova tentativa.", table: { category: "EVENTS", type: { summary: "(content: string) => Promise<ChatMessage>" } } },
    onMessagesChange: { control: false, description: "Notifica alterações do histórico visual, incluindo mensagens locais com IDs temporários. Não persiste os dados.", table: { category: "EVENTS", type: { summary: "(messages: ChatMessage[]) => void" } } },
    onError: { control: false, description: "Notifica uma falha no envio ou na resposta.", table: { category: "EVENTS", type: { summary: "(error: Error) => void" } } },
    onMinimize: { control: false, description: "Notifica quando o usuário minimiza o chat flutuante.", table: { category: "EVENTS", type: { summary: "() => void" } } },
    onMaximize: { control: false, description: "Notifica quando o usuário maximiza o chat flutuante.", table: { category: "EVENTS", type: { summary: "() => void" } } },
    onRestore: { control: false, description: "Notifica quando o usuário reabre o chat minimizado ou restaura seu tamanho.", table: { category: "EVENTS", type: { summary: "() => void" } } },
  },
  decorators: [(Story) => <Box sx={{ width: "100%", minWidth: 0, p: niar.spacing.xl, boxSizing: "border-box" }}><Story /></Box>],
  parameters: {
    layout: "fullscreen",
    docs: {
      codePanel: true,
      description: { component: "Chat para conversas do assistente, integrado ao layout ou flutuante. Recebe mensagens da API e adapta a resposta internamente. Os estados da janela são internos e as ações são notificadas por eventos." },
      source: { code: '<Chat messages={messages} onSend={sendMessage} />' },
    },
  },
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundExample(props: ChatProps) {
  const failedOnce = useRef(false);
  return <Chat {...props} onSend={async (content) => {
    if (content.toLowerCase() === "erro" && !failedOnce.current) {
      failedOnce.current = true;
      throw new Error("Falha de conexão. Tente novamente.");
    }
    return props.onSend(content);
  }} />;
}

export const Playground: Story = {
  render: (args) => <PlaygroundExample {...args} />,
  parameters: { docs: {
    description: { story: 'Explore as propriedades nos controles. Envie "erro" para visualizar a mensagem de falha e a ação Tentar novamente. Enquanto o envio estiver pendente, uma nova submissão fica bloqueada.' },
    source: { code: '<Chat messages={messages} onSend={sendMessage} />' },
  } },
};

export const Fixed: Story = {
  args: { variant: "fixed" },
  parameters: { controls: { disable: true }, docs: {
    description: { story: "Chat integrado que ocupa a largura disponível, sem controles de janela. O subtítulo identifica a seção em discussão." },
    source: { code: '<Chat variant="fixed" title="Assistente do projeto" subtitle="Seção: Contexto" messages={messages} onSend={sendMessage} />' },
  } },
};

export const Floating: Story = {
  args: { variant: "floating", title: "Assistente consultivo", subtitle: "Conversa geral", messages: messages.map((message) => ({ ...message, channel: "advisory", section_key: null })) },
  parameters: { controls: { disable: true }, docs: {
    story: { inline: false, iframeHeight: 760 },
    description: { story: "Chat ancorado no canto inferior direito. Minimize, maximize e restaure usando os botões do cabeçalho: o histórico e o rascunho são preservados. A maximização ocupa a área disponível da janela." },
    source: { code: '<Chat variant="floating" title="Assistente consultivo" messages={messages} onSend={sendMessage} onMinimize={handleMinimize} onMaximize={handleMaximize} onRestore={handleRestore} />' },
  } },
};
