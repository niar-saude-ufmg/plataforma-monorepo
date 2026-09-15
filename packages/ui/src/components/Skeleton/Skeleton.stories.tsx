import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Componentes/Skeleton",
  component: Skeleton,
  args: { variant: "text", lines: 3, height: 20 },
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "rectangular", "rounded", "circular"],
      description: "Define o formato do placeholder.",
      table: { category: "PROPS", defaultValue: { summary: "text" } },
    },
    lines: {
      control: "number",
      description: "Quantidade de placeholders.",
      table: { category: "PROPS", defaultValue: { summary: "3" } },
    },
    height: {
      control: "number",
      description: "Altura de cada placeholder.",
      table: { category: "PROPS", defaultValue: { summary: "20" } },
    },
    width: {
      control: "text",
      description: "Largura dos placeholders.",
      table: { category: "PROPS", defaultValue: { summary: "100%" } },
    },
    "aria-label": {
      control: "text",
      description: "Nome acessível do estado de carregamento.",
      table: { category: "ACCESSIBILITY", defaultValue: { summary: "Carregando conteúdo" } },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Placeholder visual para preservar o layout enquanto o conteúdo é carregado.",
      },
      source: { code: '<Skeleton variant="text" lines={3} />' },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Configure o formato, quantidade e dimensões." },
    },
  },
};
export const Text: Story = {
  args: { variant: "text", lines: 3 },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Placeholder para linhas de texto." },
      source: { code: '<Skeleton variant="text" lines={3} height={20} />' },
    },
  },
};
export const Rectangular: Story = {
  args: { variant: "rectangular", lines: 1, height: 160 },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Placeholder retangular para blocos de conteúdo." },
      source: {
        code: '<Skeleton variant="rectangular" lines={1} height={160} />',
      },
    },
  },
};
export const Rounded: Story = {
  args: { variant: "rounded", lines: 2, height: 80 },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Placeholder com cantos arredondados." },
      source: { code: '<Skeleton variant="rounded" lines={2} height={80} />' },
    },
  },
};
export const Circular: Story = {
  args: { variant: "circular", lines: 1, height: 64 },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Placeholder circular para avatares ou ícones." },
      source: { code: '<Skeleton variant="circular" lines={1} height={64} />' },
    },
  },
};
