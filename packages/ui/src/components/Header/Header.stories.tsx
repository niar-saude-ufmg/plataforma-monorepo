import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import { Header } from "./Header";

const meta = {
  title: "Componentes/Header",
  component: Header,
  parameters: { layout: "fullscreen", docs: { codePanel: true } },
  argTypes: {
    logo: {
      control: "boolean",
      description: "Exibe o logo padrão do NIAR à esquerda do conteúdo.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    logoAlt: {
      control: "text",
      description:
        "Texto alternativo do logo exibido para tecnologias assistivas.",
      table: { category: "PROPS", defaultValue: { summary: "NIAR" } },
    },
    logoHref: {
      control: "text",
      description: "Destino do link acionado ao clicar no logo.",
      table: { category: "PROPS", defaultValue: { summary: "/" } },
    },
    onLogoClick: {
      action: "logo clicked",
      description: "Evento executado quando o logo é acionado.",
      table: { category: "EVENTS" },
    },
    children: {
      description:
        "Conteúdo do cabeçalho, como navegação, ações ou identificação da pessoa usuária.",
      table: { category: "PROPS" },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ boxSizing: "border-box", display: "block", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: <ContentSlot />,
  },
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Cabeçalho com uma área de conteúdo ocupando toda a largura disponível.",
      },
      source: { code: "<Header><div>Content</div></Header>" },
    },
  },
};

export const WithLogo: Story = {
  args: {
    logo: true,
    children: <ContentSlot />,
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Cabeçalho com o logo NIAR e uma área de conteúdo.",
      },
      source: {
        code: "<Header logo><div>Content</div></Header>",
      },
    },
  },
};

function ContentSlot() {
  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: "grey.100",
        border: "1px dashed",
        borderColor: "grey.400",
        color: "text.secondary",
        display: "flex",
        flex: 1,
        justifyContent: "center",
        minHeight: 40,
        p: 2,
      }}
    >
      Content
    </Box>
  );
}
