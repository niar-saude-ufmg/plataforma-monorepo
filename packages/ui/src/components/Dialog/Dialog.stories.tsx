import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Dialog } from "./Dialog";
const meta = {
  title: "Componentes/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  args: {
    open: false,
    title: "Enviar projeto",
    children: "Confira as informações antes de enviar.",
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir dialog</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Confirmar envio"
          actions={
            <>
              <Button onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="contained" onClick={() => setOpen(false)}>
                Confirmar
              </Button>
            </>
          }
        >
          Deseja enviar este projeto?
        </Dialog>
      </>
    );
  },
};
