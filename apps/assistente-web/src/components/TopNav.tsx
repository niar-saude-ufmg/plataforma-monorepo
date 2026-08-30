import { Link, NavLink } from 'react-router-dom';
import { APP_ROUTES } from '@niar/config';
import { useAuth } from '../context/AuthContext';
import { assistantRoute } from '../routes';
import { niarLogo } from '../assets/niar-logo';

const NAV_ITEMS = [
  { to: assistantRoute(), label: 'Início', end: true },
  { to: assistantRoute('/projects'), label: 'Projetos', end: false },
  { to: assistantRoute('/perfil'), label: 'Perfil', end: false },
  { to: assistantRoute('/informacoes'), label: 'Informações', end: false },
] as const;

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="top-nav">
      <Link to={assistantRoute()} className="top-nav-brand" aria-label="NIAr-Saúde — Início">
        <img src={niarLogo} alt="NIAr-Saúde" className="top-nav-logo" />
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
          <Link to={APP_ROUTES.admin} className="nav-link nav-link-admin">Administração</Link>
        )}
        <button type="button" className="btn secondary small" onClick={logout}>Sair</button>
      </div>
    </header>
  );
}
