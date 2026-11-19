import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { WizardSession } from '../types/assistant.types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getProjects } from '../store/projects/projects.api';
import { selectProjects, selectProjectsError } from '../store/projects/projects.selectors';
import { assistantRoute } from '../routes';
import { DOC_STEP_LABELS } from '../constants';

function sectionCount(session: WizardSession) {
  return Object.keys(session.section_data).filter((k) => !k.startsWith('_') && session.section_data[k]).length;
}

function cleaningStatusLabel(session: WizardSession): string {
  const step = session.linked_cleaning_step;
  if (!step) return 'Engenharia de Dados: pendente';
  if (step === 'export') return 'Engenharia de Dados: concluída';
  return 'Engenharia de Dados: em andamento';
}

export default function ProjectListPage() {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectProjects);
  const error = useAppSelector(selectProjectsError);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  return (
    <div className="page">
      <header className="header">
        <h1>Sessões de Projeto</h1>
        <Link to={assistantRoute('/projects/new')} className="btn">Novo Projeto</Link>
      </header>
      {error && <p className="error">{error.message}</p>}
      {sessions.length === 0 && <p className="muted">Nenhuma sessão salva ainda. Inicie um novo projeto para criar uma.</p>}
      <ul className="session-list">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link to={assistantRoute(`/projects/${s.id}`)}>
              <strong>{s.title}</strong>
              <span>{DOC_STEP_LABELS[s.current_step] || s.current_step}</span>
              <span>{cleaningStatusLabel(s)}</span>
              <span>{sectionCount(s)} seções preenchidas</span>
              <span>{new Date(s.updated_at).toLocaleString('pt-BR')}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
