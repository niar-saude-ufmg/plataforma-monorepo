import type { Meta, StoryObj } from "@storybook/react-vite";
import { Autocomplete } from "./Autocomplete";

const meta = {
  title: "Componentes/Autocomplete",
  component: Autocomplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      codePanel: true,
      description: {
        component: "Campo de busca e seleção baseado no Autocomplete do MUI.",
      },
    },
  },
  args: {
    options: ["Opção 1", "Opção 2", "Opção 3"],
    label: "Autocomplete",
  },
} satisfies Meta<typeof Autocomplete>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: { docs: { description: { story: "Uso básico para selecionar uma opção." } } },
};
export const Multiple: Story = {
  args: { multiple: true, label: "Filtros" },
  parameters: { docs: { description: { story: "Permite selecionar várias opções." } } },
};
