import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function roleLabel(role: string) {
  if (role === 'admin') return 'Administrador';
  return 'Pesquisador';
}

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="page">
      <header className="page-intro">
        <h1>Perfil</h1>
        <p className="muted">Informações da sua conta neste assistente.</p>
      </header>

      <div className="profile-card">
        <dl className="profile-details">
          <div>
            <dt>Nome</dt>
            <dd>{user.full_name}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Papel</dt>
            <dd>{roleLabel(user.role)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{user.is_active ? 'Ativo' : 'Inativo'}</dd>
          </div>
        </dl>

        <div className="profile-actions">
          {user.role === 'admin' && (
            <Link to="/admin" className="btn secondary">Administração</Link>
          )}
          <button type="button" className="btn secondary" onClick={logout}>Sair</button>
        </div>
      </div>
    </div>
  );
}
