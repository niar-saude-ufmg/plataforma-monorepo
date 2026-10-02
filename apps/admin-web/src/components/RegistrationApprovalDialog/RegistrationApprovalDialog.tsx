import { Button, Dialog } from '@niar/ui';
import './RegistrationApprovalDialog.scss';

type RegistrationApprovalDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function RegistrationApprovalDialog({
  open,
  onClose,
}: RegistrationApprovalDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cadastro enviado"
      aria-label="Resultado do cadastro público"
      closeLabel="Fechar mensagem"
      actions={
        <Button onClick={onClose}>Entendi</Button>
      }
    >
      <div className="registration-approval-dialog">
        <p>Recebemos os dados do seu cadastro.</p>
        <p>
          As informações serão verificadas pela equipe responsável e o acesso à plataforma depende da aprovação do cadastro.
        </p>
      </div>
    </Dialog>
  );
}
