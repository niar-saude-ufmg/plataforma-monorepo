import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { defaultUserRole, hasAccessToRoute, isProtectedRoute, SESSION_STORAGE_KEY } from "@niar/auth";
import { APP_ROUTES, APP_TITLES } from "@niar/config";
import { UserRole } from "@niar/contracts";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

type SessionUser = {
  name: string;
  role: UserRole;
};

const readSession = (): SessionUser | null => {
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as SessionUser) : null;
};

const writeSession = (user: SessionUser | null) => {
  if (!user) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
};

function LoginPage({
  onLogin
}: {
  onLogin: (user: SessionUser) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("Pesquisador Exemplo");
  const [role, setRole] = useState<UserRole>(defaultUserRole);
  const redirectTo = (location.state as { from?: string } | null)?.from ?? APP_ROUTES.admin;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin({ name, role });
    navigate(redirectTo, { replace: true });
  };

  return (
    <main className="page auth-page">
      <section className="card auth-card">
        <p className="eyebrow">Shell principal</p>
        <h1>{APP_TITLES.login}</h1>
        <p className="muted">
          Neste primeiro corte a shell já nasce como dona da autenticação e do redirecionamento
          para as áreas protegidas.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Perfil
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="researcher">Pesquisador</option>
              <option value="admin">Admin</option>
              <option value="committee">Comissão</option>
            </select>
          </label>
          <button type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}

export default function App() {
  const location = useLocation();
  const [user, setUser] = useState<SessionUser | null>(() => readSession());

  const canAccessCurrentRoute = useMemo(() => {
    if (!isProtectedRoute(location.pathname)) {
      return true;
    }

    return hasAccessToRoute(user?.role, location.pathname);
  }, [location.pathname, user?.role]);

  const login = (nextUser: SessionUser) => {
    writeSession(nextUser);
    setUser(nextUser);
  };

  const logout = () => {
    writeSession(null);
    setUser(null);
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <p className="eyebrow">NIAR</p>
          <strong>Shell da Plataforma</strong>
        </div>
        <nav className="nav-links">
          <Link to={APP_ROUTES.home}>Início</Link>
          <Link to={APP_ROUTES.admin}>Admin</Link>
          <Link to={APP_ROUTES.assistant}>Assistente</Link>
          <Link to={APP_ROUTES.login}>Login</Link>
        </nav>
        <div className="session-box">
          {user ? (
            <>
              <span>{user.name}</span>
              <button type="button" onClick={logout}>
                Sair
              </button>
            </>
          ) : (
            <span>Sem sessão</span>
          )}
        </div>
      </header>

      {!canAccessCurrentRoute && <Navigate replace to={APP_ROUTES.login} state={{ from: location.pathname }} />}

      <Routes>
        <Route path={APP_ROUTES.home} element={<HomePage />} />
        <Route path={APP_ROUTES.login} element={<LoginPage onLogin={login} />} />
        <Route
          path={APP_ROUTES.admin}
          element={
            <ProtectedRoute userRole={user?.role}>
              <DashboardPage
                title={APP_TITLES.admin}
                description="Área protegida do fluxo administrativo inicial."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.assistant}
          element={
            <ProtectedRoute userRole={user?.role}>
              <DashboardPage
                title={APP_TITLES.assistant}
                description="Ponto de integração futuro com o microfrontend do assistente."
              />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
