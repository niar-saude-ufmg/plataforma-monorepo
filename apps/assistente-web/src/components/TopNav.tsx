import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Início', end: true },
  { to: '/projects', label: 'Projetos', end: false },
  { to: '/perfil', label: 'Perfil', end: false },
  { to: '/informacoes', label: 'Informações', end: false },
] as const;

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="top-nav">
      <Link to="/" className="top-nav-brand" aria-label="NIAr-Saúde — Início">
        <img src="/niar-logo.png" alt="NIAr-Saúde" className="top-nav-logo" />
      </Link>
      <nav className="nav-links" aria-label="Menu principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="top-nav-actions">
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link nav-link-admin">Administração</Link>
        )}
        <button type="button" className="btn secondary small" onClick={logout}>Sair</button>
      </div>
    </header>
  );
}
