import type { Meta, StoryObj } from "@storybook/react-vite";
import { niar } from "../../tokens/index";
import { Button } from "./Button";

const variants = ["contained", "outlined", "text"] as const;
const sizes = ["small", "medium", "large"] as const;

const meta = {
  title: "Componentes/Button",
  component: Button,
  args: {
    children: "Button",
    variant: "contained",
    color: "primary",
    size: "medium",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: variants,
      description: "Define o estilo visual do botão.",
      table: { category: "PROPS", defaultValue: { summary: "contained" } },
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "inverse", "danger"],
      description: "Define a cor semântica do botão a partir do tema NIAR.",
      table: { category: "PROPS", defaultValue: { summary: "primary" } },
    },
    size: {
      control: "select",
      options: sizes,
      description: "Define a densidade e o tamanho do botão.",
      table: { category: "PROPS", defaultValue: { summary: "medium" } },
    },
    children: {
      control: "text",
      description: "Conteúdo textual que nomeia a ação do botão.",
      table: { category: "PROPS", defaultValue: { summary: "Button" } },
    },
    disabled: {
      control: "boolean",
      description: "Impede a interação quando a ação não está disponível.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    onClick: {
      action: "clicked",
      description:
        "Callback do MUI executado ao ativar o botão; recebe o MouseEvent<HTMLButtonElement>.",
      table: { category: "EVENTS", defaultValue: { summary: "undefined" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Botão MUI configurado pelo NiarProvider, com estilos e variantes definidos junto ao componente.",
      },
      source: { code: '<Button variant="contained">Continuar</Button>' },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: niar.spacing.xl,
};

export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Use o playground para experimentar as propriedades disponíveis antes de escolher a variante da ação.",
      },
      source: {
        code: '<Button variant="contained" color="primary">Continuar</Button>',
      },
    },
  },
};

export const Primary: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Apresenta as três variantes com a cor primária." },
      source: {
        code: `<Button color="primary" variant="contained">Contained</Button>
<Button color="primary" variant="outlined">Outlined</Button>
<Button color="primary" variant="text">Text</Button>`,
      },
    },
  },
  render: () => (
    <div style={rowStyle}>
      {variants.map((variant) => (
        <Button key={variant} color="primary" variant={variant}>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Secondary: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Apresenta as três variantes com a cor secundária.",
      },
      source: {
        code: `<Button color="secondary" variant="contained">Contained</Button>
<Button color="secondary" variant="outlined">Outlined</Button>
<Button color="secondary" variant="text">Text</Button>`,
      },
    },
  },
  render: () => (
    <div style={rowStyle}>
      {variants.map((variant) => (
        <Button key={variant} color="secondary" variant={variant}>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Danger: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Apresenta as três variantes para ações destrutivas ou irreversíveis.",
      },
      source: {
        code: `<Button color="danger" variant="contained">Contained</Button>
<Button color="danger" variant="outlined">Outlined</Button>
<Button color="danger" variant="text">Text</Button>`,
      },
    },
  },
  render: () => (
    <div style={rowStyle}>
      {variants.map((variant) => (
        <Button key={variant} color="danger" variant={variant}>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Inverse: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Apresenta as variantes do botão inverse sobre uma superfície escura.",
      },
      source: {
        code: `<Button color="inverse" variant="contained">Contained</Button>
<Button color="inverse" variant="outlined">Outlined</Button>
<Button color="inverse" variant="text">Text</Button>`,
      },
    },
  },
  render: () => (
    <div
      style={{
        ...rowStyle,
        backgroundColor: niar.colors.brand.deep,
        padding: niar.spacing.xl,
      }}
    >
      {(["contained", "outlined", "text"] as const).map((variant) => (
        <Button key={variant} color="inverse" variant={variant}>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Compara os tamanhos disponíveis para a mesma ação.",
      },
      source: {
        code: `<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>`,
      },
    },
  },
  render: () => (
    <div style={rowStyle}>
      {sizes.map((size) => (
        <Button key={size} color="primary" variant="contained" size={size}>
          {size[0].toUpperCase() + size.slice(1)}
        </Button>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Mostra como as variantes ficam quando a ação está indisponível.",
      },
      source: { code: "<Button disabled>Continuar</Button>" },
    },
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, max-content)",
        gap: niar.spacing.xl,
      }}
    >
      {variants.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          {variant[0].toUpperCase() + variant.slice(1)}
        </Button>
      ))}
    </div>
  ),
};
