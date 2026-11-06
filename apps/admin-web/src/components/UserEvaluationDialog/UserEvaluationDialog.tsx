import { Button, Card, Dialog, Textarea, ListText, RadioGroup } from '@niar/ui';
import { useState } from 'react';
import type { EvaluateUserInput, UserListItem } from '../../types/user.types';
import './UserEvaluationDialog.scss';

type UserEvaluationDialogProps = {
  user: UserListItem;
  loading: boolean;
  downloading: boolean;
  onClose: () => void;
  onSave: (input: EvaluateUserInput) => void;
  onDownload: () => void;
};

export function UserEvaluationDialog({ user, loading, downloading, onClose, onSave, onDownload }: UserEvaluationDialogProps) {
  const [decision, setDecision] = useState('');
  const [justification, setJustification] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const justificationRequired = decision === 'rejected' && !justification.trim();
  const save = () => {
    setSubmitted(true);
    if ((decision !== 'active' && decision !== 'rejected') || justificationRequired || loading) return;
    onSave({ userId: user.id, status: decision, justification: justification.trim() || undefined });
  };

  return (
    <Dialog
      open
      title={`Avaliar cadastro de ${user.fullName}`}
      minWidth="min(90vw, 720px)"
      onClose={loading ? undefined : onClose}
      showCloseButton={false}
      actions={(
        <>
          <Button variant="outlined" disabled={loading} onClick={onClose}>Cancelar</Button>
          <Button variant="contained" disabled={loading} onClick={save}>Salvar avaliação</Button>
        </>
      )}
    >
      <div className="user-evaluation-dialog">
        <p>Confira as informações do COEP antes de registrar a decisão.</p>
        <Card variant="outlined">
          <h3>Informações do COEP</h3>
          <div className="user-evaluation-dialog__coep">
            <ListText items={[
              { label: 'CAAE', value: user.coep?.caae || 'Não informado' },
              { label: 'Data de aprovação', value: user.coep?.approvalDate ? user.coep.approvalDate.split('-').reverse().join('/') : 'Não informado' },
            ]} />
            <div>
              <ListText items={[{ label: 'Número do parecer', value: user.coep?.opinionNumber || 'Não informado' }]} />
              <Button variant="outlined" disabled={!user.coep || downloading} onClick={onDownload}>Baixar documento</Button>
            </div>
          </div>
        </Card>
        <RadioGroup
          label="Decisão do cadastro"
          row
          options={[{ label: 'Aprovar', value: 'active', disabled: loading }, { label: 'Reprovar', value: 'rejected', disabled: loading }]}
          value={decision}
          onChange={(event) => { if (!loading) setDecision(event.target.value); }}
        />
        {submitted && !decision ? <p role="alert">Selecione a decisão do cadastro.</p> : null}
        <Textarea
          label="Justificativa"
          placeholder="Justifique a decisão"
          fullWidth
          disabled={loading}
          value={justification}
          onChange={(event) => setJustification(event.target.value)}
          error={submitted && justificationRequired}
          helperText={submitted && justificationRequired ? 'Informe a justificativa da reprovação.' : 'A justificativa é obrigatória quando o cadastro for reprovado.'}
        />
      </div>
    </Dialog>
  );
}
