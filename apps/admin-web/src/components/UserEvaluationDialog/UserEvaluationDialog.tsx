import { useEffect, useState } from 'react';
import { Button, RadioGroup, Textarea } from '@niar/ui';
import { FixedDialog } from '../FixedDialog';
import type { UserListItem } from '../../types/user.types';
import './UserEvaluationDialog.scss';

export type UserEvaluationDecision = 'active' | 'rejected';

export type UserEvaluationDialogProps = {
  open: boolean;
  user: UserListItem | null;
  loading?: boolean;
  downloadLoading?: boolean;
  onDownloadCoep: () => void;
  onClose: () => void;
  onSubmit: (decision: UserEvaluationDecision, justification?: string) => void;
};

export function UserEvaluationDialog({
  open,
  user,
  loading = false,
  downloadLoading = false,
  onDownloadCoep,
  onClose,
  onSubmit,
}: UserEvaluationDialogProps) {
  const [decision, setDecision] = useState<UserEvaluationDecision | ''>('');
  const [justification, setJustification] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDecision('');
      setJustification('');
      setValidationError(null);
    }
  }, [open]);

  if (!user) return null;

  const handleConfirm = () => {
    if (!decision) {
      setValidationError('Selecione uma decisão.');
      return;
    }

    if (decision === 'rejected' && !justification.trim()) {
      setValidationError('A justificativa é obrigatória quando o cadastro é reprovado.');
      return;
    }

    setValidationError(null);
    onSubmit(decision, justification.trim() || undefined);
  };

  const handleDownload = () => {
    onDownloadCoep();
  };

  // Formata data de YYYY-MM-DD para DD/MM/YYYY
  const formatDate = (date?: string) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <FixedDialog
      open={open}
      title={`Avaliar cadastro de ${user.fullName}`}
      onClose={onClose}
      ariaLabel="Avaliar cadastro de pesquisador"
      minWidth="600px"
      actions={
        <>
          <Button type="button" variant="text" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" variant="contained" color="primary" onClick={handleConfirm} disabled={loading} >
            {loading ? "Salvando..." : "Salvar avaliação" }
          </Button>
        </>
      }
    >
      <div className="user-evaluation-dialog">
        <p className="user-evaluation-dialog__description">
          Confira as informações do COEP antes de registrar a decisão.
        </p>

        {user.coep && (
          <div className="user-evaluation-dialog__coep-box">
            <h4 className="user-evaluation-dialog__coep-title">Informações do COEP</h4>
            <div className="user-evaluation-dialog__coep-grid">
              <div>
                <span className="user-evaluation-dialog__label">CAAE</span>
                <span className="user-evaluation-dialog__value">{user.coep.caae}</span>
              </div>
              <div>
                <span className="user-evaluation-dialog__label">Número do parecer</span>
                <span className="user-evaluation-dialog__value">Parecer {user.coep.opinionNumber}</span>
              </div>
              <div>
                <span className="user-evaluation-dialog__label">Data de aprovação</span>
                <span className="user-evaluation-dialog__value">{formatDate(user.coep.approvalDate)}</span>
              </div>
              <div className="user-evaluation-dialog__coep-action">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleDownload}
                  disabled={downloadLoading}
                >
                  {downloadLoading ? 'Baixando' : 'Baixar documento'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="user-evaluation-dialog__form">
          <div className="user-evaluation-dialog__radio-group">
            <RadioGroup
              label="Decisão do cadastro"
              value={decision}
              onChange={(event) => {
                setDecision(event.target.value as UserEvaluationDecision);
                if (validationError && !decision) setValidationError(null);
              }}
              row={true}
              options={[
                { value: 'active', label: 'Aprovar' },
                { value: 'rejected', label: 'Reprovar' },
              ]}
            />
            {validationError && !decision ? (
              <span className="user-evaluation-dialog__error" role="alert">
                Selecione uma decisão.
              </span>
            ) : null}
          </div>
          <Textarea
            label="Justificativa"
            placeholder="Justifique a decisão"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            helperText={validationError || 'A justificativa é obrigatória quando o cadastro é reprovado.'}
            error={Boolean(validationError)}
          />
        </div>
      </div>
    </FixedDialog>
  );
}
