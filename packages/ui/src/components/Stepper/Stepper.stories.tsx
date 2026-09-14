import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "./Stepper";

const meta = {
  title: "Componentes/Stepper",
  component: Stepper,
  args: {
    steps: ["Dados", "Revisão", "Envio"],
    activeStep: 1,
    orientation: "horizontal",
  },
  argTypes: {
    steps: {
      control: "object",
      description: "Etapas em texto ou objetos com label e description.",
      table: { category: "PROPS" },
    },
    activeStep: {
      control: "number",
      description: "Índice da etapa ativa.",
      table: { category: "PROPS", defaultValue: { summary: "0" } },
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Direção visual das etapas.",
      table: { category: "PROPS", defaultValue: { summary: "horizontal" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Indicador de progresso por etapas, horizontal ou vertical, com descrições opcionais.",
      },
      source: {
        code: '<Stepper steps={["Dados", "Revisão", "Envio"]} activeStep={1} />',
      },
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: { story: "Configure orientação, etapa ativa e conteúdo." },
    },
  },
};
export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    steps: [
      { label: "Dados", description: "Preencha o projeto" },
      { label: "Revisão", description: "Confira as informações" },
      { label: "Envio", description: "Encaminhe à comissão" },
    ],
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Stepper horizontal com labels e descrições opcionais.",
      },
      source: {
        code: '<Stepper orientation="horizontal" steps={[{ label: "Dados", description: "Preencha o projeto" }, { label: "Revisão", description: "Confira as informações" }, { label: "Envio", description: "Encaminhe à comissão" }]} />',
      },
    },
  },
};
export const Vertical: Story = {
  args: {
    orientation: "vertical",
    steps: [
      { label: "Dados", description: "Preencha o projeto" },
      { label: "Revisão", description: "Confira as informações" },
      { label: "Envio", description: "Encaminhe à comissão" },
    ],
  },
  parameters: {
    controls: { disable: true },
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story: "Stepper vertical com descrição dentro de cada etapa.",
      },
      source: {
        code: '<Stepper orientation="vertical" steps={[{ label: "Dados", description: "Preencha o projeto" }, { label: "Revisão", description: "Confira as informações" }, { label: "Envio", description: "Encaminhe à comissão" }]} />',
      },
    },
  },
};
