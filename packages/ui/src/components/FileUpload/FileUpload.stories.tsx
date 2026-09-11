import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpload } from "./FileUpload";
const meta = {
  title: "Componentes/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  args: { label: "Selecionar documento", accept: ".pdf,.doc,.docx" },
} satisfies Meta<typeof FileUpload>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Multiple: Story = {
  args: { multiple: true, label: "Selecionar documentos" },
};
export const Disabled: Story = { args: { disabled: true } };
