import { Link } from 'react-router-dom';
import { APP_ROUTES } from '@niar/config';
import { useAuth, type User } from '../context/AuthContext';

function roleLabel(role: string) {
  if (role === 'admin') return 'Administrador';
  return 'Pesquisador';
}

function accountStatusLabel(status: User['account_status']) {
  const labels: Record<User['account_status'], string> = {
    pending: 'Pendente',
    active: 'Ativo',
    rejected: 'Rejeitado',
    disabled: 'Desativado',
  };

  return labels[status];
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
            <dd>{accountStatusLabel(user.account_status)}</dd>
          </div>
        </dl>

        <div className="profile-actions">
          {user.role === 'admin' && (
            <Link to={APP_ROUTES.admin} className="btn secondary">Administração</Link>
          )}
          <button type="button" className="btn secondary" onClick={logout}>Sair</button>
        </div>
      </div>
    </div>
  );
}
