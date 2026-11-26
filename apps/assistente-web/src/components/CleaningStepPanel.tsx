import { useEffect, useRef, useState } from 'react';
import type { WizardSession } from '../types/assistant.types';
import { CleaningVersionsPanel, CleaningVersion } from './CleaningVersionsPanel';
import { ChatPanel } from './ChatPanel';
import { DatasetExplorer } from './DatasetExplorer';
import { LoadingPanel } from './LoadingPanel';
import { Stepper } from './Stepper';
import {
  CLEAN_BUSINESS_TOPICS,
  DATASET_SYNTHETIC_ALERT,
  EMBEDDED_CLEAN_STEP_KEYS,
  EMBEDDED_CLEAN_STEPS,
} from '../constants';
import { errorMessage } from '../services/http';
import {
  generateCleaningScript, generateInitialCleaningScript, getCleaning, getCleaningVersions,
  restoreCleaningVersion, saveCleaningVersion, sendCleaningChat, startCleaningKickoff,
  startNewCleaningVersion, updateCleaning, validateCleaningScript,
} from '../store/cleaning/cleaning.api';
import { selectCleaningVersions } from '../store/cleaning/cleaning.selectors';
import { getDatasets, getDatasetSchema } from '../store/datasets/datasets.api';
import { selectDatasets, selectDatasetSchema } from '../store/datasets/datasets.selectors';
import { clearDatasetSchema } from '../store/datasets/datasets.slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { submitProjectForReview } from '../store/projects/projects.api';

const STEP_INDEX: Record<string, number> = {
  select_dataset: 0,
  schema_explore: 1,
  discussion: 2,
  script_draft: 3,
  validation: 4,
  export: 5,
};

interface SchemaData {
  tables: Array<{
    id: number;
    name: string;
    description: string;
    sample_rows?: Array<Record<string, unknown>>;
    columns: Array<{
      id: number;
      name: string;
      data_type: string;
      nullable: boolean;
      is_primary_key: boolean;
      is_foreign_key: boolean;
      description: string;
      valid_values: string;
      is_phi: boolean;
    }>;
  }>;
}

interface CleaningStepPanelProps {
  session: WizardSession;
  projectId: number;
  onSessionChange: (session: WizardSession) => void;
  onError: (message: string) => void;
  onSaveMessage: (message: string) => void;
}

export function CleaningStepPanel({
  session,
  projectId,
  onSessionChange,
  onError,
  onSaveMessage,
}: CleaningStepPanelProps) {
  const dispatch = useAppDispatch();
  const datasets = useAppSelector(selectDatasets);
  const schema = useAppSelector(selectDatasetSchema) as SchemaData | null;
  const versions = useAppSelector(selectCleaningVersions) as CleaningVersion[];
  const [generating, setGenerating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [kickoffLoading, setKickoffLoading] = useState(false);
  const [versionSaving, setVersionSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialScriptLoading, setInitialScriptLoading] = useState(false);
  const initialScriptAttempted = useRef(false);

  const stepIndex = STEP_INDEX[session.current_step] ?? 0;

  const loadSchema = async (datasetId: number) => {
    await dispatch(getDatasetSchema(datasetId)).unwrap();
  };

  const loadVersions = async (sessionId: number) => {
    try {
      await dispatch(getCleaningVersions(sessionId)).unwrap();
    } catch { /* o histórico é complementar */ }
  };

  useEffect(() => {
    dispatch(getDatasets());
  }, [dispatch]);

  useEffect(() => {
    if (session.dataset_id) {
      loadSchema(session.dataset_id).catch(() => dispatch(clearDatasetSchema()));
    } else {
      dispatch(clearDatasetSchema());
    }
    loadVersions(session.id);
  }, [session.id, session.dataset_id]);

  const refresh = async () => {
    const s = await dispatch(getCleaning(session.id)).unwrap();
    onSessionChange(s);
    if (s.dataset_id) await loadSchema(s.dataset_id);
    await loadVersions(s.id);
  };

  const goToStep = async (step: string) => {
    const updated = await dispatch(updateCleaning({ id: session.id, data: { current_step: step } })).unwrap();
    onSessionChange(updated);
    if (updated.dataset_id) await loadSchema(updated.dataset_id);
  };

  const goToStepIndex = (index: number) => {
    goToStep(EMBEDDED_CLEAN_STEP_KEYS[index]);
  };

  const selectDataset = async (datasetId: number) => {
    const updated = await dispatch(updateCleaning({ id: session.id, data: {
      dataset_id: datasetId,
      current_step: 'schema_explore',
    } })).unwrap();
    onSessionChange(updated);
    await loadSchema(datasetId);
  };

  useEffect(() => {
    initialScriptAttempted.current = false;
  }, [session.id]);

  useEffect(() => {
    if (stepIndex !== 1 || !session.dataset_id || !session.linked_project_id) return;
    if (session.script_content?.trim() || initialScriptLoading || initialScriptAttempted.current) return;

    let cancelled = false;
    initialScriptAttempted.current = true;
    (async () => {
      setInitialScriptLoading(true);
      onError('');
      try {
        const result = await dispatch(generateInitialCleaningScript(session.id)).unwrap();
        if (cancelled) return;
        const updated = await dispatch(getCleaning(session.id)).unwrap();
        onSessionChange(updated);
        if (!result.already_exists) {
          onSaveMessage('Rascunho inicial do script gerado com base no plano de análise do projeto.');
        }
      } catch (e) {
        if (!cancelled) {
          onError(errorMessage(e, 'Não foi possível gerar o rascunho inicial do script'));
          initialScriptAttempted.current = false;
        }
      } finally {
        if (!cancelled) setInitialScriptLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [stepIndex, session.id, session.dataset_id, session.linked_project_id, session.script_content]);

  useEffect(() => {
    if (stepIndex !== 2 || session.messages.length > 0 || kickoffLoading) return;
    let cancelled = false;
    (async () => {
      setKickoffLoading(true);
      try {
        await dispatch(startCleaningKickoff(session.id)).unwrap();
        if (!cancelled) await refresh();
      } catch (e) {
        if (!cancelled) {
          onError(errorMessage(e, 'Não foi possível iniciar a discussão de planejamento'));
        }
      } finally {
        if (!cancelled) setKickoffLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [session.id, stepIndex, session.messages.length]);

  const saveVersion = async (label: string, notes: string) => {
    setVersionSaving(true);
    onError('');
    try {
      await dispatch(saveCleaningVersion({ id: session.id, data: { label, notes } })).unwrap();
      await loadVersions(session.id);
      onSaveMessage('Versão salva com sucesso.');
    } catch (e) {
      onError(errorMessage(e, 'Falha ao salvar versão'));
    } finally {
      setVersionSaving(false);
    }
  };

  const startNewVersion = async (saveCurrent: boolean, currentLabel: string, notes: string) => {
    setVersionSaving(true);
    onError('');
    setKickoffLoading(false);
    try {
      const updated = await dispatch(startNewCleaningVersion({ id: session.id, data: {
        save_current: saveCurrent,
        current_label: currentLabel,
        notes,
      } })).unwrap();
      onSessionChange(updated);
      await loadVersions(session.id);
      onSaveMessage(
        saveCurrent
          ? 'Nova versão iniciada. Rascunho anterior salvo. Explore os dados e planeje a partir da base zerada.'
          : 'Nova versão iniciada a partir da base zerada.'
      );
    } catch (e) {
      onError(errorMessage(e, 'Falha ao iniciar nova versão'));
    } finally {
      setVersionSaving(false);
    }
  };

  const restoreVersion = async (versionId: number) => {
    setVersionSaving(true);
    onError('');
    try {
      const updated = await dispatch(restoreCleaningVersion({ id: session.id, versionId })).unwrap();
      onSessionChange(updated);
      onSaveMessage('Versão carregada no rascunho atual.');
    } catch (e) {
      onError(errorMessage(e, 'Falha ao abrir versão'));
    } finally {
      setVersionSaving(false);
    }
  };

  const submitForReview = async () => {
    if (submitting) return;
    setSubmitting(true);
    onError('');
    onSaveMessage('');
    try {
      await dispatch(submitProjectForReview(projectId)).unwrap();
      onSaveMessage(
        'Projeto enviado para avaliação. O documento foi baixado no seu computador.'
      );

      try {
        const updated = await dispatch(getCleaning(session.id)).unwrap();
        onSessionChange(updated);
      } catch {
        console.warn('Não foi possível atualizar a sessão após a submissão.');
      }
    } catch (e) {
      onSaveMessage('');
      onError(errorMessage(e, 'Falha na submissão para avaliação, por favor verifique o status do projeto e tente novamente.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChat = async (content: string) => {
    const optimisticUser = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    onSessionChange({
      ...session,
      messages: [...session.messages, optimisticUser],
    });
    try {
      await dispatch(sendCleaningChat({ id: session.id, content })).unwrap();
      await refresh();
    } catch (e) {
      await refresh();
      onError(errorMessage(e, 'Falha ao enviar mensagem'));
    }
  };

  const sortedMessages = [...session.messages].sort((a, b) => a.id - b.id);

  const generateScript = async () => {
    if (generating) return;
    setGenerating(true);
    onError('');
    try {
      const result = await dispatch(generateCleaningScript(session.id)).unwrap();
      const updated = await dispatch(getCleaning(session.id)).unwrap();
      onSessionChange({
        ...updated,
        script_content: result.script_content,
        validation_result: result.validation_result,
        current_step: 'script_draft',
      });
      onSaveMessage('Script data_clean.py gerado. Revise o rascunho na próxima etapa.');
    } catch (e) {
      onError(errorMessage(e, 'Falha na geração do script'));
    } finally {
      setGenerating(false);
    }
  };

  const validateScript = async () => {
    if (validating) return;
    setValidating(true);
    onError('');
    try {
      const result = await dispatch(validateCleaningScript(session.id)).unwrap();
      onSessionChange({ ...session, validation_result: result, current_step: 'validation' });
    } catch (e) {
      onError(errorMessage(e, 'Falha na validação'));
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="cleaning-step-panel">
      <Stepper steps={EMBEDDED_CLEAN_STEPS} current={stepIndex} onStepClick={goToStepIndex} />

      {session.dataset_id && stepIndex >= 1 && (
        <CleaningVersionsPanel
          versions={versions}
          hasDraftScript={Boolean(session.script_content?.trim())}
          onSaveVersion={saveVersion}
          onNewVersion={startNewVersion}
          onRestore={restoreVersion}
          saving={versionSaving}
        />
      )}

      {stepIndex === 0 && (
        <div className="wizard-section">
          <h2>Selecionar Conjunto de Dados</h2>
          <p className="dataset-synthetic-alert" role="alert">
            {DATASET_SYNTHETIC_ALERT}
          </p>
          <p className="muted">
            Escolha o conjunto de dados do estudo. O assistente usará o contexto do documento do projeto
            vinculado ao planejar a engenharia de dados.
          </p>
          {datasets.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`dataset-card ${session.dataset_id === d.id ? 'selected' : ''}`}
              onClick={() => selectDataset(d.id)}
            >
              <strong>{d.name}</strong>
              <p>{d.description}</p>
              {session.dataset_id === d.id && <span className="muted">Selecionado atualmente</span>}
            </button>
          ))}
          {session.dataset_id && (
            <div className="wizard-actions">
              <button type="button" onClick={() => goToStep('schema_explore')}>Continuar</button>
            </div>
          )}
        </div>
      )}

      {stepIndex === 1 && (
        <div className="wizard-section">
          <h2>Explorar Dados</h2>
          <p className="dataset-synthetic-alert" role="alert">
            {DATASET_SYNTHETIC_ALERT}
          </p>
          <p className="muted">
            Revise a estrutura do banco de dados (tabelas e colunas). As amostras exibidas são sintéticas
            e servem apenas como referência visual do esquema.
          </p>
          {initialScriptLoading && (
            <LoadingPanel message="Gerando rascunho inicial do script com base no plano de análise…" />
          )}
          {!initialScriptLoading && session.script_content?.trim() && (
            <p className="save-message">
              Rascunho inicial do script disponível. Abra <strong>Rascunho do Script</strong> para revisar
              ou continue para refinar na discussão.
            </p>
          )}
          {schema ? (
            <DatasetExplorer tables={schema.tables} />
          ) : (
            <LoadingPanel message="Carregando estrutura e amostras do conjunto de dados…" />
          )}
          <div className="wizard-actions">
            <button type="button" className="btn secondary" onClick={() => goToStep('select_dataset')}>Voltar</button>
            <button type="button" onClick={() => goToStep('discussion')}>Continuar para Discussão de Planejamento</button>
          </div>
        </div>
      )}

      {stepIndex === 2 && (
        <div className="wizard-section split">
          <h2>Discussão de Planejamento</h2>
          <p className="muted">
            Trabalhe seus objetivos de modelagem e preparação de dados em linguagem simples. O assistente perguntará sobre
            definição da coorte, filtros, junções e o conjunto final de dados necessário.
          </p>
          <p className="intake-warning">
            {session.script_content?.trim()
              ? 'Já existe um rascunho inicial do script. Use o chat para refinar e clique em Gerar Script para atualizar o código.'
              : 'A discussão fica no chat até você clicar em Gerar Script.'}
          </p>
          <div className="topic-checklist">
            <strong>Tópicos que abordaremos</strong>
            <ul>
              {CLEAN_BUSINESS_TOPICS.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
          {kickoffLoading && session.messages.length === 0 ? (
            <LoadingPanel message="Analisando a estrutura e amostras dos seus dados…" />
          ) : (
            <ChatPanel
              messages={sortedMessages}
              onSend={handleChat}
              placeholder="Descreva seu objetivo de modelagem, regras da coorte, filtros ou transformações..."
            />
          )}
          <div className="wizard-actions">
            <button type="button" className="btn secondary" onClick={() => goToStep('schema_explore')}>Voltar</button>
            {session.script_content?.trim() && (
              <button type="button" className="btn secondary" onClick={() => goToStep('script_draft')}>
                Ver rascunho inicial
              </button>
            )}
            <button type="button" onClick={generateScript} disabled={generating}>
              {generating ? 'Gerando…' : 'Gerar Script'}
            </button>
          </div>
          {generating && <LoadingPanel message="Gerando data_clean.py a partir da sua discussão…" />}
        </div>
      )}

      {stepIndex === 3 && (
        <div className="wizard-section">
          <h2>Rascunho do Script</h2>
          <textarea
            className="code-editor"
            value={session.script_content}
            onChange={(e) => onSessionChange({ ...session, script_content: e.target.value })}
            onBlur={async () => {
              const updated = await dispatch(updateCleaning({ id: session.id, data: { script_content: session.script_content } })).unwrap();
              onSessionChange(updated);
            }}
            rows={20}
          />
          <div className="wizard-actions">
            <button type="button" className="btn secondary" onClick={() => goToStep('discussion')}>Voltar</button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => saveVersion('', '')}
              disabled={versionSaving || !session.script_content?.trim()}
            >
              Salvar versão
            </button>
            <button type="button" onClick={validateScript} disabled={validating}>
              {validating ? 'Validando…' : 'Validar Script'}
            </button>
          </div>
          {validating && <LoadingPanel message="Validando sintaxe e segurança do script…" />}
        </div>
      )}

      {stepIndex === 4 && (
        <div className="wizard-section">
          <h2>Resultados da Validação</h2>
          <div className={`validation-result ${session.validation_result?.valid ? 'valid' : 'invalid'}`}>
            <p>Sintaxe: {session.validation_result?.syntax_ok ? 'OK' : 'Falhou'}</p>
            <p>Segurança: {session.validation_result?.safety_ok ? 'OK' : 'Falhou'}</p>
            <p>Lint: {session.validation_result?.lint_ok ? 'OK' : 'Falhou'}</p>
            <ul>
              {((session.validation_result?.issues as string[]) || []).map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>
          <div className="wizard-actions">
            <button type="button" className="btn secondary" onClick={() => goToStep('script_draft')}>Voltar ao script</button>
            <button type="button" onClick={() => goToStep('export')}>Ir para Submissão</button>
          </div>
        </div>
      )}

      {stepIndex === 5 && (
        <div className="wizard-section">
          <h2>Submeter para Avaliação</h2>
          <p className="muted">
            Envie o plano de análise (projeto.docx) e o script de engenharia de dados (data_clean.py)
            em um único pacote para revisão. O script deve estar validado e não pode conter DDL
            (ex.: CREATE TABLE).
          </p>
          {session.validation_result?.valid === false && (
            <p className="intake-warning">
              O script ainda não passou na validação. Corrija os problemas antes de submeter.
            </p>
          )}
          <div className="wizard-actions">
            <button type="button" className="btn secondary" onClick={() => goToStep('validation')}>Voltar</button>
            <button type="button" className="btn secondary" onClick={() => goToStep('script_draft')}>Revisar script</button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => saveVersion('', '')}
              disabled={versionSaving || !session.script_content?.trim()}
            >
              Salvar versão
            </button>
            <button
              type="button"
              onClick={submitForReview}
              disabled={
                submitting
                || !session.script_content?.trim()
                || session.validation_result?.valid === false
              }
            >
              {submitting
                ? 'Enviando…'
                : 'Enviar para avaliação'}
            </button>
          </div>
          {submitting && <LoadingPanel message="Gerando o documento do projeto e registrando a submissão…" />}
        </div>
      )}
    </div>
  );
}
