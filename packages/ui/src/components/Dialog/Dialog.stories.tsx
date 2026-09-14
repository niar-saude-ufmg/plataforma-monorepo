import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Dialog } from "./Dialog";
const meta = {
  title: "Componentes/Dialog",
  component: Dialog,
  args: {
    open: false,
    title: "Enviar projeto",
    children: "Confira as informações antes de enviar.",
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Controla a visibilidade do dialog.",
      table: { category: "PROPS", defaultValue: { summary: "false" } },
    },
    title: {
      control: "text",
      description: "Título opcional exibido no cabeçalho.",
      table: { category: "PROPS" },
    },
    showCloseButton: {
      control: "boolean",
      description: "Exibe o botão de fechar no cabeçalho.",
      table: { category: "PROPS", defaultValue: { summary: "true" } },
    },
    minWidth: {
      control: "text",
      description: "Largura mínima do painel do dialog.",
      table: { category: "PROPS", defaultValue: { summary: "360" } },
    },
    onClose: {
      action: "closed",
      description: "Callback executado ao fechar o dialog.",
      table: { category: "EVENTS" },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Painel modal para confirmar ações ou exibir informações que exigem atenção.",
      },
      source: {
        code: '<Dialog open title="Confirmar envio">Deseja enviar este projeto?</Dialog>',
      },
    },
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    docs: {
      canvas: { sourceState: "shown" },
      description: {
        story:
          "Exemplo controlado com abertura, fechamento e ações de cancelar ou confirmar.",
      },
      source: {
        code: `<Dialog open={open} onClose={() => setOpen(false)} title="Confirmar envio" actions={<><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained">Confirmar</Button></>}>Deseja enviar este projeto?</Dialog>`,
      },
    },
  },
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
