import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "./Stepper";
const meta = {
  title: "Componentes/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  args: { steps: ["Dados", "Revisão", "Envio"], activeStep: 1 },
} satisfies Meta<typeof Stepper>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const HorizontalDescriptions: Story = {
  args: {
    orientation: "horizontal",
    alternativeLabel: true,
    steps: [
      { label: "Dados", description: "Preencha o projeto" },
      { label: "Revisão", description: "Confira as informações" },
      { label: "Envio", description: "Encaminhe à comissão" },
    ],
  },
};
export const VerticalDescriptions: Story = {
  args: {
    orientation: "vertical",
    steps: [
      { label: "Dados", description: "Preencha o projeto" },
      { label: "Revisão", description: "Confira as informações" },
      { label: "Envio", description: "Encaminhe à comissão" },
    ],
  },
};
