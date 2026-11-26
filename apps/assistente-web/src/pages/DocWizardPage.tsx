import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { SectionData, WizardSession } from '../types/assistant.types';
import { ChatPanel } from '../components/ChatPanel';
import { CleaningStepPanel } from '../components/CleaningStepPanel';
import { LoadingPanel } from '../components/LoadingPanel';
import { ProjectWorkspaceLayout } from '../components/ProjectWorkspaceLayout';
import { SectionDraftPreviewModal } from '../components/SectionDraftPreviewModal';
import { assistantRoute } from '../routes';
import { SectionProgressBar, countFilledSections } from '../components/SectionProgressBar';
import { Stepper } from '../components/Stepper';
import { DOC_SECTIONS, DOC_SECTION_HINTS, DOC_STEP_KEYS, DOC_STEPS } from '../constants';
import { errorMessage } from '../services/http';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createProject, createProjectCleaning, exportProject, extractProjectSection, getProject,
  getProjectCleaning, importProjectDocx, importProjectText, runProjectQualityCheck,
  saveProjectDraft, sendAdvisoryChat, sendProjectChat, updateProject,
} from '../store/projects/projects.api';
import {
  selectCurrentProject,
  selectLinkedCleaning,
  selectProjectCleaningOperation,
  selectProjectDownloadOperation,
  selectProjectExtractOperation,
  selectProjectImportOperation,
  selectProjectLoadOperation,
  selectProjectQualityOperation,
  selectProjectSaveOperation,
} from '../store/projects/projects.selectors';
import { setLinkedCleaning, setSelectedProject } from '../store/projects/projects.slice';

const START_TABS = [
  { id: 'blank', label: 'Começar do zero' },
  { id: 'text', label: 'Importar texto' },
  { id: 'docx', label: 'Importar documento' },
] as const;

type StartTab = (typeof START_TABS)[number]['id'];

const STEP_INDEX: Record<string, number> = {
  start: 0,
  project: 1,
  review: 2,
  data_engineering: 3,
  basics: 0,
  intake: 1,
  quality: 2,
  export: 3,
  cleaning: 3,
};

function normalizeStep(step: string): string {
  return STEP_INDEX[step] !== undefined ? step : 'start';
}

function stepIndexFor(step: string): number {
  return STEP_INDEX[step] ?? 0;
}

function sectionLabel(key: string) {
  return DOC_SECTIONS.find((s) => s.key === key)?.label || key;
}

function intakeMessages(session: WizardSession, sectionKey: string) {
  return session.messages
    .filter(
      (m) =>
        (m.channel ?? 'intake') === 'intake' &&
        (m.section_key ?? DOC_SECTIONS[0].key) === sectionKey
    )
    .sort((a, b) => a.id - b.id);
}

function sectionHasIntakeChat(session: WizardSession, sectionKey: string) {
  return intakeMessages(session, sectionKey).length > 0;
}

export default function DocWizardPage() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const session = useAppSelector(selectCurrentProject);
  const cleaningSession = useAppSelector(selectLinkedCleaning);
  const loadOperation = useAppSelector(selectProjectLoadOperation);
  const saveOperation = useAppSelector(selectProjectSaveOperation);
  const importOperation = useAppSelector(selectProjectImportOperation);
  const extractOperation = useAppSelector(selectProjectExtractOperation);
  const qualityOperation = useAppSelector(selectProjectQualityOperation);
  const cleaningOperation = useAppSelector(selectProjectCleaningOperation);
  const downloadOperation = useAppSelector(selectProjectDownloadOperation);
  const [title, setTitle] = useState('');
  const [fullText, setFullText] = useState('');
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [draftPreview, setDraftPreview] = useState<{
    sectionKey: string;
    content: string;
    complete: boolean;
    missing: string[];
  } | null>(null);
  const [activeSection, setActiveSection] = useState(DOC_SECTIONS[0].key);
  const [lastExtract, setLastExtract] = useState<{ section: string; at: string; complete?: boolean; missing?: string[] } | null>(null);
  const [docSaveStatus, setDocSaveStatus] = useState('');
  const [startTab, setStartTab] = useState<StartTab>('blank');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSectionData = useRef<SectionData | null>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const loading = !isNew && !session && loadOperation.status !== 'failed';
  const importing = importOperation.status === 'pending' && importOperation.operation === importProjectText.pending.type;
  const importingDocx = importOperation.status === 'pending' && importOperation.operation === importProjectDocx.pending.type;
  const extracting = extractOperation.status === 'pending' && extractOperation.operation === extractProjectSection.pending.type;
  const savingDraft = saveOperation.status === 'pending' && saveOperation.operation === updateProject.pending.type;
  const checklistLoading = qualityOperation.status === 'pending' && qualityOperation.operation === runProjectQualityCheck.pending.type;
  const cleaningLoading = cleaningOperation.status === 'pending' && [getProjectCleaning.pending.type, createProjectCleaning.pending.type].includes(cleaningOperation.operation ?? '');
  const exporting = downloadOperation.status === 'pending' && downloadOperation.operation === exportProject.pending.type;

  useEffect(() => {
    if (isNew) {
      dispatch(setSelectedProject(null));
      dispatch(setLinkedCleaning(null));
      return;
    }
    dispatch(setLinkedCleaning(null));
    dispatch(getProject(Number(id))).unwrap()
      .then((s) => {
        setTitle(s.title);
        const current = s.section_data._current_section;
        if (typeof current === 'string') setActiveSection(current);
      })
      .catch((e) => setError(errorMessage(e, 'Falha ao carregar projeto')));
  }, [dispatch, id, isNew]);

  const stepIndex = session ? stepIndexFor(normalizeStep(session.current_step)) : 0;

  const loadCleaningSession = async (projectId: number, createIfMissing = false) => {
    setError('');
    try {
      const cleaning = createIfMissing
        ? await dispatch(createProjectCleaning(projectId)).unwrap()
        : await dispatch(getProjectCleaning(projectId)).unwrap();
      dispatch(setLinkedCleaning(cleaning));
      await dispatch(getProject(projectId)).unwrap();
    } catch (e) {
      const message = errorMessage(e, 'Falha ao carregar engenharia de dados vinculada');
      if (!createIfMissing && message.includes('Engenharia de dados não iniciada')) {
        dispatch(setLinkedCleaning(null));
      } else {
        setError(message);
      }
    }
  };

  useEffect(() => {
    if (!session || stepIndex !== 3) return;
    if (cleaningSession) return;
    loadCleaningSession(session.id, true);
  }, [session?.id, stepIndex]);

  const ensureSession = async (): Promise<WizardSession> => {
    if (session) return session;
    const s = await dispatch(createProject(title || 'Projeto sem título')).unwrap();
    navigate(assistantRoute(`/projects/${s.id}`), { replace: true });
    setTitle(s.title);
    return s;
  };

  const refresh = async () => {
    if (!session) return;
    const s = await dispatch(getProject(session.id)).unwrap();
    setTitle(s.title);
  };

  const saveDraft = async (exit = false) => {
    if (!session) return;
    const payload = {
      title: title || session.title,
      current_step: session.current_step,
      section_data: session.section_data,
    };
    const saved = await dispatch(saveProjectDraft({ id: session.id, data: payload })).unwrap();
    setSaveMessage(`Rascunho salvo em ${new Date(saved.updated_at).toLocaleString('pt-BR')}`);
    if (exit) navigate(assistantRoute('/projects'));
  };

  const goToStep = async (step: string) => {
    const s = session || (await ensureSession());
    await dispatch(updateProject({ id: s.id, data: { current_step: step } })).unwrap();
  };

  const confirmLeaveProject = (): boolean => {
    if (!session || stepIndex !== 1) return true;
    const hasChat = sectionHasIntakeChat(session, activeSection);
    const activeUnsaved = hasChat && !hasSectionContent(activeSection);
    if (activeUnsaved) {
      return window.confirm(
        `A seção "${sectionLabel(activeSection)}" ainda não foi salva no documento a partir do chat. ` +
        'O conteúdo do chat não entra no project.docx automaticamente. Deseja continuar mesmo assim?'
      );
    }
    return true;
  };

  const goToStepGuarded = async (step: string) => {
    if (!confirmLeaveProject()) return;
    await goToStep(step);
  };

  const goToStepIndex = (index: number) => {
    if (!session && index > 0) return;
    if (session && stepIndex === 1 && index !== 1 && !confirmLeaveProject()) return;
    goToStep(DOC_STEP_KEYS[index]);
  };

  const importFullText = async () => {
    if (fullText.trim().length < 20) {
      setError('Cole pelo menos 20 caracteres para importar.');
      return;
    }
    setError('');
    setSaveMessage('');
    try {
      const s = await ensureSession();
      const updated = await dispatch(importProjectText({ id: s.id, fullText: fullText.trim() })).unwrap();
      const filled = countFilledSections(updated.section_data);
      if (filled === 0) {
        setError('Falha na importação: nenhuma seção foi extraída. Tente novamente ou preencha as seções manualmente.');
        return;
      }
      setFullText('');
      setSaveMessage(`Importado em ${filled} seção${filled === 1 ? '' : 'ões'}. Revise o documento à direita ou continue no chat guiado.`);
    } catch (e) {
      setError(errorMessage(e, 'Falha na importação'));
    }
  };

  const importDocx = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setError('Envie um arquivo .docx');
      return;
    }
    setError('');
    setSaveMessage('');
    try {
      const s = await ensureSession();
      const updated = await dispatch(importProjectDocx({ id: s.id, file })).unwrap();
      const filled = countFilledSections(updated.section_data);
      if (filled === 0) {
        setError('Falha na importação: nenhuma seção foi extraída.');
        return;
      }
      setSaveMessage(`Documento importado em ${filled} seção${filled === 1 ? '' : 'ões'}.`);
    } catch (e) {
      setError(errorMessage(e, 'Falha na importação do .docx'));
    } finally {
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  const startBlank = async () => {
    setError('');
    await ensureSession();
    await goToStep('project');
    setSaveMessage('Projeto iniciado do zero. Edite o documento à direita ou use o chat guiado no centro.');
  };

  const persistSectionData = useCallback(async (sectionData: SectionData) => {
    if (!session) return;
    setDocSaveStatus('Salvando…');
    try {
      await dispatch(updateProject({ id: session.id, data: { section_data: sectionData } })).unwrap();
      setDocSaveStatus('Documento salvo');
    } catch {
      setDocSaveStatus('Erro ao salvar documento');
    }
  }, [session?.id]);

  const scheduleDocumentSave = useCallback(
    (sectionData: SectionData) => {
      pendingSectionData.current = sectionData;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (pendingSectionData.current) {
          persistSectionData(pendingSectionData.current);
        }
      }, 800);
    },
    [persistSectionData]
  );

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const handleDocumentSectionChange = (key: string, value: string) => {
    if (!session) return;
    const updated = { ...session.section_data, [key]: value };
    dispatch(setSelectedProject({ ...session, section_data: updated }));
    scheduleDocumentSave(updated);
  };

  const handleAdvisorySend = async (content: string) => {
    if (!session) return;
    setError('');
    const optimisticUser = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      channel: 'advisory',
      section_key: null,
    };
    dispatch(setSelectedProject({
      ...session,
      messages: [...session.messages, optimisticUser],
    }));
    try {
      await dispatch(sendAdvisoryChat({ id: session.id, content })).unwrap();
      await refresh();
    } catch (e) {
      await refresh();
      setError(errorMessage(e, 'Falha ao enviar mensagem'));
    }
  };

  const selectSection = async (sectionKey: string) => {
    setActiveSection(sectionKey);
    if (!session) return;
    const updatedData = { ...session.section_data, _current_section: sectionKey };
    await dispatch(updateProject({ id: session.id, data: { section_data: updatedData } })).unwrap();
  };

  const handleChat = async (content: string) => {
    if (!session) return;
    setError('');
    const optimisticUser = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      channel: 'intake',
      section_key: activeSection,
    };
    dispatch(setSelectedProject({
      ...session,
      messages: [...session.messages, optimisticUser],
    }));
    try {
      await dispatch(sendProjectChat({ id: session.id, content })).unwrap();
      await refresh();
    } catch (e) {
      await refresh();
      setError(errorMessage(e, 'Falha ao enviar mensagem'));
    }
  };

  const extractSection = async (sectionKey: string) => {
    if (!session) return;
    setError('');
    try {
      const result = await dispatch(extractProjectSection({ id: session.id, sectionKey })).unwrap();
      const content = String(result.content || '').trim();
      const missing = Array.isArray(result.missing) ? result.missing.map(String) : [];
      if (!content) {
        setSaveMessage(`Nenhum conteúdo gerado para "${sectionLabel(sectionKey)}". Continue o chat e tente novamente.`);
        return;
      }
      setDraftPreview({
        sectionKey,
        content,
        complete: Boolean(result.complete),
        missing,
      });
    } catch (e) {
      setError(errorMessage(e, 'Falha ao gerar texto da seção'));
    }
  };

  const saveDraftToDocument = async (content: string) => {
    if (!session || !draftPreview) return;
    setError('');
    try {
      const sectionData = {
        ...session.section_data,
        [draftPreview.sectionKey]: content,
        _current_section: draftPreview.sectionKey,
      };
      await dispatch(updateProject({ id: session.id, data: { section_data: sectionData } })).unwrap();
      setActiveSection(draftPreview.sectionKey);
      const preview = content.length > 120
        ? `${content.slice(0, 120)}…`
        : content;
      const missingNote = draftPreview.missing.length
        ? ` Pendências: ${draftPreview.missing.join(', ')}.`
        : !draftPreview.complete
          ? ' Seção ainda incompleta; continue o chat se necessário.'
          : '';
      setLastExtract({
        section: draftPreview.sectionKey,
        at: new Date().toISOString(),
        complete: draftPreview.complete,
        missing: draftPreview.missing,
      });
      setSaveMessage(`Salvo em "${sectionLabel(draftPreview.sectionKey)}": ${preview}${missingNote}`);
      setDraftPreview(null);
    } catch (e) {
      setError(errorMessage(e, 'Falha ao salvar no documento'));
    }
  };

  const runQuality = async () => {
    if (!session || checklistLoading) return;
    setError('');
    try {
      await dispatch(runProjectQualityCheck(session.id)).unwrap();
      await refresh();
    } catch (e) {
      setError(errorMessage(e, 'Falha na revisão do projeto'));
    }
  };

  const goToDataEngineering = async () => {
    if (!session) return;
    await loadCleaningSession(session.id, true);
    await goToStep('data_engineering');
  };

  const exportDoc = async () => {
    if (!session || exporting) return;
    setError('');
    try {
      await dispatch(exportProject(session.id)).unwrap();
      setSaveMessage('project.docx baixado com sucesso.');
    } catch (e) {
      setError(errorMessage(e, 'Falha na exportação'));
    }
  };

  const hasSectionContent = (key: string) => Boolean(String(session?.section_data[key] || '').trim());

  const hasChatWithoutSave = session && sectionHasIntakeChat(session, activeSection) && !hasSectionContent(activeSection);

  const checklistItems = session?.quality_checklist.items || [];
  const checklistRun = checklistItems.length > 0;
  const allPassed = checklistRun && checklistItems.every((item) => item.passed);
  const failedItems = checklistItems.filter((item) => !item.passed);

  if (loading) return <div className="page"><p>Carregando...</p></div>;

  const showStartScreen = !session || stepIndex === 0;
  const showProjectWorkspace = session && stepIndex === 1;

  const projectCenter = session && (
    <div className="intake-center">
      <p className="muted intake-chat-hint">
        Converse sobre <strong>{sectionLabel(activeSection)}</strong>. Use <strong>Gerar texto da seção</strong> para
        redigir a partir do chat, revisar na prévia e salvar no documento à direita.
      </p>
      {hasChatWithoutSave && (
        <p className="intake-warning">⚠ Esta seção tem conversa no chat, mas ainda não foi salva no documento.</p>
      )}
      {DOC_SECTION_HINTS[activeSection] && (
        <p className="section-hint">{DOC_SECTION_HINTS[activeSection]}</p>
      )}
      {hasSectionContent(activeSection) && (
        <p className="section-filled">✓ Conteúdo salvo nesta seção</p>
      )}
      <ChatPanel
        messages={intakeMessages(session, activeSection)}
        onSend={handleChat}
        placeholder={`Converse sobre a seção ${sectionLabel(activeSection)}…`}
        emptyMessage="Nenhuma conversa nesta seção ainda. Envie uma mensagem para começar."
      />
      <div className="wizard-actions">
        <button type="button" className="btn secondary" onClick={() => goToStep('start')}>Voltar</button>
        <button type="button" className="btn secondary" onClick={() => extractSection(activeSection)} disabled={extracting}>
          {extracting ? 'Gerando…' : 'Gerar texto da seção'}
        </button>
        <button type="button" onClick={() => goToStepGuarded('review')}>Revisar Projeto</button>
      </div>
    </div>
  );

  return (
    <div className={`page wizard-page ${showProjectWorkspace ? 'wizard-page--workspace' : ''}`}>
      <header className="header">
        <div>
          <Link to={assistantRoute('/projects')}>← Todas as sessões</Link>
          <h1>Assistente de Documento do Projeto</h1>
          {session && <p className="muted">Sessão #{session.id} · Última atualização {new Date(session.updated_at).toLocaleString('pt-BR')}</p>}
        </div>
        {session && (
          <div className="header-actions">
            <button type="button" className="btn secondary" onClick={exportDoc} disabled={exporting}>
              {exporting ? 'Exportando…' : 'Baixar Projeto'}
            </button>
            <button type="button" className="btn secondary" onClick={() => saveDraft(false)}>Salvar rascunho</button>
            <button type="button" className="btn secondary" onClick={() => saveDraft(true)}>Salvar e sair</button>
          </div>
        )}
      </header>

      {session && (
        <Stepper steps={DOC_STEPS} current={stepIndex} onStepClick={goToStepIndex} />
      )}
      {!session && <Stepper steps={DOC_STEPS} current={0} />}

      {showStartScreen && (
        <p className="purpose-banner-compact">
          Documente dados, métodos e entregáveis do estudo: comece do zero, importe texto ou envie um .docx.
        </p>
      )}

      {session && showProjectWorkspace && (
        <div className="workspace-toolbar">
          <div className="workspace-toolbar-row">
            {lastExtract && (
              <span className="muted workspace-toolbar-meta">
                Última extração: {sectionLabel(lastExtract.section)}
                {lastExtract.complete === false && ' (incompleta)'}
              </span>
            )}
            <span className="workspace-toolbar-step muted">Projeto de Pesquisa</span>
          </div>
          <SectionProgressBar
            sectionData={session.section_data}
            hasIntakeChat={(key) => sectionHasIntakeChat(session, key)}
            activeSection={activeSection}
            onSectionClick={selectSection}
          />
        </div>
      )}

      {saveMessage && <p className="save-message">{saveMessage}</p>}
      {error && <pre className="error debug-error">{error}</pre>}

      {showStartScreen && (
        <div className="wizard-section start-screen">
          <h2>Inicie o documento do seu projeto</h2>
          <p className="muted">
            Escolha como deseja começar. Focamos em dados, métodos e entregáveis do estudo.
          </p>
          <label className="start-title-field">
            Título do Projeto
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={async () => {
                if (session && title !== session.title) {
                  await dispatch(updateProject({ id: session.id, data: { title } })).unwrap();
                }
              }}
              placeholder="Meu Projeto de Ciência de Dados em Saúde"
            />
          </label>

          <div className="start-tabs section-tabs" role="tablist" aria-label="Forma de iniciar o projeto">
            {START_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={startTab === tab.id}
                className={startTab === tab.id ? 'active' : ''}
                onClick={() => setStartTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {startTab === 'blank' && (
            <div className="start-tab-panel" role="tabpanel">
              <h3>Projeto em branco</h3>
              <p className="muted">
                Crie um documento vazio e preencha as seções manualmente ou com o chat guiado
                na etapa Projeto de Pesquisa.
              </p>
              <div className="wizard-actions">
                <button type="button" onClick={startBlank}>Começar do zero</button>
              </div>
            </div>
          )}

          {startTab === 'text' && (
            <div className="start-tab-panel" role="tabpanel">
              <h3>Importar texto</h3>
              <p className="muted">
                Cole uma descrição completa do projeto e o assistente dividirá automaticamente
                em todas as seções predefinidas.
              </p>
              <textarea
                value={fullText}
                onChange={(e) => setFullText(e.target.value)}
                rows={12}
                placeholder="Cole o texto completo do seu projeto aqui..."
              />
              <div className="wizard-actions">
                <button
                  type="button"
                  onClick={importFullText}
                  disabled={importing || fullText.trim().length < 20}
                >
                  {importing
                    ? (fullText.trim().length >= 6000
                        ? 'Dividindo documento longo…'
                        : 'Dividindo com IA…')
                    : 'Importar e dividir em seções'}
                </button>
              </div>
              {importing && <LoadingPanel message="Processando texto e dividindo em seções…" />}
            </div>
          )}

          {startTab === 'docx' && (
            <div className="start-tab-panel" role="tabpanel">
              <h3>Importar documento</h3>
              <p className="muted">
                Envie um arquivo Word (.docx). O texto será extraído e dividido nas seções do projeto.
              </p>
              <div className="start-file-upload">
                <input
                  ref={docxInputRef}
                  id="start-docx-input"
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="start-file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importDocx(file);
                  }}
                  disabled={importingDocx}
                />
                <label htmlFor="start-docx-input" className={`start-file-label ${importingDocx ? 'disabled' : ''}`}>
                  {importingDocx ? 'Processando documento…' : 'Selecionar arquivo .docx'}
                </label>
              </div>
              {importingDocx && <LoadingPanel message="Lendo .docx e dividindo em seções…" />}
            </div>
          )}
        </div>
      )}

      {showProjectWorkspace && (
        <ProjectWorkspaceLayout
          session={session}
          activeSection={activeSection}
          onActiveSectionChange={selectSection}
          onSectionChange={handleDocumentSectionChange}
          onAdvisorySend={handleAdvisorySend}
          saveStatus={docSaveStatus}
        >
          {projectCenter}
        </ProjectWorkspaceLayout>
      )}

      {session && stepIndex === 2 && (
        <div className="wizard-section">
          <h2>Revisar Projeto</h2>
          <p className="muted">Execute a lista de verificação e avance para engenharia de dados quando estiver pronto.</p>
          <button type="button" onClick={runQuality} disabled={checklistLoading}>
            {checklistLoading ? 'Executando lista…' : 'Executar lista de verificação'}
          </button>
          {checklistLoading && (
            <LoadingPanel message="Revisando seções do documento…" />
          )}
          {!checklistLoading && checklistRun && (
            <ul className="checklist">
              {checklistItems.map((item, i) => (
                <li key={item.id || i} className={item.passed ? 'pass' : 'fail'}>
                  {item.passed ? '✓' : '✗'} {item.item}
                  {item.note && <small> ({item.note})</small>}
                </li>
              ))}
            </ul>
          )}
          {!checklistLoading && !checklistRun && (
            <p className="muted">Nenhum resultado ainda. Clique em Executar lista de verificação para avaliar seu documento.</p>
          )}
          <div className="wizard-actions">
            <button type="button" className="btn secondary" onClick={() => goToStep('project')} disabled={checklistLoading}>
              Voltar ao projeto
            </button>
            {checklistRun && allPassed && (
              <button type="button" onClick={goToDataEngineering} disabled={checklistLoading || cleaningLoading}>
                Ir para Engenharia de Dados
              </button>
            )}
            {checklistRun && !allPassed && (
              <>
                <p className="intake-warning">
                  Pendências: {failedItems.map((i) => i.item).join('; ')}
                </p>
                <button type="button" className="btn secondary" onClick={goToDataEngineering} disabled={checklistLoading || cleaningLoading}>
                  Ir para Engenharia de Dados mesmo assim
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {session && stepIndex === 3 && (
        <div className="wizard-section">
          <h2>Engenharia de Dados</h2>
          <p className="muted">
            Planeje e gere o script data_clean.py com base no esquema do conjunto
            e no contexto do documento do estudo.
          </p>
          {cleaningLoading && <LoadingPanel message="Preparando sessão de engenharia de dados vinculada…" />}
          {!cleaningLoading && cleaningSession && (
            <CleaningStepPanel
              session={cleaningSession}
              projectId={session.id}
              onSessionChange={(value) => dispatch(setLinkedCleaning(value))}
              onError={setError}
              onSaveMessage={setSaveMessage}
            />
          )}
        </div>
      )}

      <SectionDraftPreviewModal
        open={draftPreview !== null}
        sectionLabel={draftPreview ? sectionLabel(draftPreview.sectionKey) : ''}
        initialContent={draftPreview?.content ?? ''}
        complete={draftPreview?.complete ?? true}
        missing={draftPreview?.missing ?? []}
        saving={savingDraft}
        onCancel={() => setDraftPreview(null)}
        onSave={(content) => void saveDraftToDocument(content)}
      />
    </div>
  );
}
