import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@mui/material/Button";
import { useState, type ComponentProps } from "react";
import { Details } from "./Details";

const items = [
  { label: "Projeto", value: "Estudo NIAR" },
  { label: "Status", value: "Em análise" },
  { label: "Responsável", value: "Usuário NIAR" },
];

const timelineItems = [
  { title: "Projeto criado", date: "10/09/2026", color: "primary" as const },
  { title: "Enviado para análise", date: "11/09/2026", color: "warning" as const },
  { title: "Em análise", date: "12/09/2026", color: "success" as const },
];

const sections = [
  {
    title: "Dados da conta",
    items: [
      { label: "Nome completo", value: "Ana Souza" },
      { label: "E-mail", value: "ana.souza@niar.org.br" },
      { label: "Perfil e status", value: "Pesquisador · Ativo" },
    ],
  },
  {
    title: "Dados do COEP",
    items: [
      { label: "CAAE", value: "12345678.9.0000.5149" },
      { label: "Número do parecer", value: "Parecer 123/2026" },
      { label: "Data de aprovação", value: "15/09/2026" },
    ],
  },
];

const meta = {
  title: "Templates/Details",
  component: Details,
  parameters: { layout: "centered", docs: { codePanel: true } },
  argTypes: {
    open: {
      control: "boolean",
      description: "Controla a visibilidade do dialog de detalhes.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    title: {
      control: "text",
      description: "Título exibido no cabeçalho do dialog.",
      table: { category: "PROPS" },
    },
    description: {
      control: "text",
      description: "Descrição exibida no corpo do template, antes do conteúdo principal.",
      table: { category: "PROPS" },
    },
    items: {
      control: "object",
      description:
        "Dados do conteúdo. Em list use label/value; em timeline use title, description, date e color.",
      table: { category: "PROPS" },
    },
    sections: {
      control: "object",
      description:
        "Subgrupos da variação list. Cada seção recebe seus itens label/value e pode receber um título.",
      table: { category: "PROPS" },
    },
    variant: {
      control: "radio",
      options: ["list", "timeline"],
      description: "Define se o conteúdo mostra detalhes ou histórico de status.",
      table: { category: "PROPS", defaultValue: { summary: "list" } },
    },
    onClose: {
      action: "closed",
      description: "Evento disparado ao fechar o dialog.",
      table: { category: "EVENTS" },
    },
    closeLabel: {
      control: "text",
      description: "Texto acessível do botão que fecha os detalhes.",
      table: { category: "ACCESSIBILITY", defaultValue: { summary: "Fechar" } },
    },
    listAriaLabel: {
      control: "text",
      description: "Nome acessível da lista de detalhes.",
      table: { category: "ACCESSIBILITY", defaultValue: { summary: "Detalhes" } },
    },
    timelineAriaLabel: {
      control: "text",
      description: "Nome acessível do histórico de alterações.",
      table: { category: "ACCESSIBILITY", defaultValue: { summary: "Linha do tempo" } },
    },
  },
} satisfies Meta<typeof Details>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { open: false, title: "Detalhes do projeto", items },
  render: (args) => <DetailsTrigger {...args} />,
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Dialog reutilizável para apresentar informações chave e valor.",
      },
      source: {
        code: `<Details
  open
  title="Detalhes do projeto"
  items={[
    { label: "Projeto", value: "Estudo NIAR" },
    { label: "Status", value: "Em análise" },
  ]}
/>`,
      },
    },
  },
};

export const TextVariant: Story = {
  args: {
    open: false,
    title: "Detalhes do projeto",
    variant: "list",
    items,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Variação para exibir informações em pares de label e value.",
      },
      source: {
        code: `<Details
  open
  title="Detalhes do projeto"
  variant="list"
  items={[
    { label: "Projeto", value: "Estudo NIAR" },
    { label: "Status", value: "Em análise" },
  ]}
/>`,
      },
    },
  },
  render: (args) => <DetailsTrigger {...args} />,
};

export const GroupedListVariant: Story = {
  args: {
    open: false,
    title: "Detalhes de Ana Souza",
    variant: "list",
    sections,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Variação de texto com subgrupos nomeados, útil quando os dados pertencem a contextos diferentes.",
      },
      source: {
        code: `<Details
  open
  title="Detalhes de Ana Souza"
  sections={[
    {
      title: "Dados da conta",
      items: [
        { label: "Nome completo", value: "Ana Souza" },
        { label: "E-mail", value: "ana.souza@niar.org.br" },
      ],
    },
    {
      title: "Dados do COEP",
      items: [
        { label: "CAAE", value: "12345678.9.0000.5149" },
        { label: "Número do parecer", value: "Parecer 123/2026" },
      ],
    },
  ]}
/>`,
      },
    },
  },
  render: (args) => <DetailsTrigger {...args} />,
};

export const TimelineVariant: Story = {
  args: {
    open: false,
    title: "Histórico de avaliações",
    description: "Estudo de saúde pública",
    variant: "timeline",
    items: timelineItems,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Variação para acompanhar as mudanças de status ao longo do tempo.",
      },
      source: {
        code: `<Details
  open
  title="Histórico de avaliações"
  description="Estudo de saúde pública"
  variant="timeline"
  items={[
    { title: "Projeto criado", date: "10/09/2026", color: "primary" },
    { title: "Em análise", date: "12/09/2026", color: "success" },
  ]}
/>`,
      },
    },
  },
  render: (args) => <DetailsTrigger {...args} />,
};

function DetailsTrigger({
  open: initialOpen,
  onClose,
  ...detailsProps
}: ComponentProps<typeof Details>) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Ver detalhes
      </Button>
      <Details
        {...detailsProps}
        open={open}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
      />
    </>
  );
}
