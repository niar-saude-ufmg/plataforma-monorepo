import type { Meta, StoryObj } from "@storybook/react-vite";
import { Logo } from "./Logo";
import { niar } from "../../tokens";

const meta = {
  title: "Componentes/Logo",
  component: Logo,
  args: { variant: "default", alt: "NIAR-Saúde" },
  argTypes: {
    variant: {
      control: "radio",
      options: ["default", "inverse"],
      description: "Seleciona a versão normal ou inversa da marca NIAR.",
      table: { category: "PROPS", defaultValue: { summary: "default" } },
    },
    alt: {
      control: "text",
      description: "Texto alternativo da marca para tecnologias assistivas.",
      table: { category: "ACCESSIBILITY" },
    },
  },
  parameters: {
    docs: {
      codePanel: true,
      description: {
        component: "Marca oficial do NIAR em suas versões para fundos claros e escuros.",
      },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div
      style={{
        background:
          args.variant === "inverse"
            ? niar.colors.brand.deep
            : niar.colors.surface.card,
        padding: niar.spacing.xl,
      }}
    >
      <div style={{ zoom: 1.35 }}>
        <Logo {...args} />
      </div>
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gap: niar.spacing.xl }}>
      <div style={{ zoom: 1.35 }}>
        <Logo alt="NIAR-Saúde" />
      </div>
      <div style={{ background: niar.colors.brand.deep, padding: niar.spacing.xl }}>
        <div style={{ zoom: 1.35 }}>
          <Logo variant="inverse" alt="NIAR-Saúde" />
        </div>
      </div>
    </div>
  ),
};
