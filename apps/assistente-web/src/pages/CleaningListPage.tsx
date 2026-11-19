import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCleaningList } from '../store/cleaning/cleaning.api';
import { selectCleaningList } from '../store/cleaning/cleaning.selectors';
import { assistantRoute } from '../routes';
import { CLEAN_STEP_LABELS } from '../constants';

export default function CleaningListPage() {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector(selectCleaningList);

  useEffect(() => {
    dispatch(getCleaningList());
  }, [dispatch]);

  return (
    <div className="page">
      <header className="header">
        <Link to={assistantRoute()}>← Painel</Link>
        <h1>Sessões de Limpeza</h1>
        <Link to={assistantRoute('/cleaning/new')} className="btn">Nova Limpeza</Link>
      </header>
      <ul className="session-list">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link to={assistantRoute(`/cleaning/${s.id}`)}>
              <strong>{s.title}</strong>
              <span>{CLEAN_STEP_LABELS[s.current_step] || s.current_step}</span>
              <span>{new Date(s.updated_at).toLocaleString('pt-BR')}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
