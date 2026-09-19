import Person from "@mui/icons-material/Person";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta = {
  title: "Componentes/Avatar",
  component: Avatar,
  args: { children: "UN", alt: "Usuário NIAR", variant: "circular" },
  argTypes: {
    children: {
      control: "text",
      description:
        "Conteúdo exibido dentro do avatar, como iniciais ou um ícone.",
      table: { category: "PROPS", defaultValue: { summary: "—" } },
    },
    alt: {
      control: "text",
      description:
        "Texto alternativo usado quando o avatar representa uma imagem de pessoa.",
      table: { category: "PROPS", defaultValue: { summary: "—" } },
    },
    src: {
      control: "text",
      description: "URL da imagem exibida no avatar.",
      table: { category: "PROPS", defaultValue: { summary: "—" } },
    },
    variant: {
      control: "select",
      options: ["circular", "rounded", "square"],
      description: "Formato visual do avatar.",
      table: {
        category: "PROPS",
        defaultValue: { summary: "circular" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Avatar para representar uma pessoa usuária por imagem, iniciais ou ícone, usando os estilos do tema NIAR.",
      },
      source: {
        code: '<Avatar alt="Usuário NIAR">UN</Avatar>',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Ajuste o conteúdo, a imagem alternativa e o formato para validar o avatar no contexto da aplicação.",
      },
    },
  },
};
export const Initials: Story = {
  args: { children: "UN", alt: "Usuário NIAR" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Use iniciais quando não houver uma imagem disponível para identificar a pessoa usuária.",
      },
      source: {
        code: '<Avatar alt="Usuário NIAR">UN</Avatar>',
      },
    },
  },
};
export const Icon: Story = {
  args: { children: <Person />, alt: "Usuário NIAR" },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Use um ícone quando a identidade visual deve representar uma pessoa sem imagem ou iniciais.",
      },
      source: {
        code: `import Person from "@mui/icons-material/Person";
import { Avatar } from "@niar/ui";

<Avatar alt="Usuário NIAR">
  <Person />
</Avatar>`,
      },
    },
  },
};
export const Image: Story = {
  args: {
    alt: "Usuário NIAR",
    src: "https://mui.com/static/images/avatar/1.jpg",
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Exiba uma imagem quando houver uma foto de perfil disponível e forneça sempre um texto alternativo.",
      },
      source: {
        code: '<Avatar alt="Usuário NIAR" src="https://mui.com/static/images/avatar/1.jpg" />',
      },
    },
  },
};
