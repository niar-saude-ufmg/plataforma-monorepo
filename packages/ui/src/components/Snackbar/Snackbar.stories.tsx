import type { Meta, StoryObj } from "@storybook/react-vite";
import { Snackbar } from "./Snackbar";
const meta = {
  title: "Componentes/Snackbar",
  component: Snackbar,
  tags: ["autodocs"],
  args: {
    open: true,
    message: "Projeto salvo com sucesso.",
    severity: "success",
    anchorOrigin: { vertical: "top", horizontal: "center" },
  },
} satisfies Meta<typeof Snackbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  decorators: [(Story) => <div style={{ minHeight: 220, width: 420 }}><Story /></div>],
};
export const Severities: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["success", "info", "warning", "error"] as const).map((severity) => (
        <Snackbar
          key={severity}
          open
          message={`Mensagem de ${severity}`}
          severity={severity}
          sx={{ position: "static", transform: "none" }}
        />
      ))}
    </div>
  ),
};
