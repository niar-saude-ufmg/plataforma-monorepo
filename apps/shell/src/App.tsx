import { FormEvent, lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  clearPlatformSession,
  hasAccessToRoute,
  isProtectedRoute,
  PlatformSessionUser,
  readPlatformSession,
  SESSION_CHANGED_EVENT,
  writePlatformSession
} from "@niar/auth";
import { APP_ROUTES, APP_TITLES } from "@niar/config";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { AuthenticatedUser, getCurrentUser, login as loginRequest } from "./services/auth-api";

type SessionUser = PlatformSessionUser;

const AdminRemote = import.meta.env.MODE === "test"
  ? lazy(async () => ({
      default: function AdminRemoteTestStub() {
        return <h1>Cadastro de pesquisador</h1>;
      }
    }))
  : lazy(() => import("admin/App"));

const AssistantRemote = import.meta.env.MODE === "test"
  ? lazy(async () => ({
      default: function AssistantRemoteTestStub() {
        return <h1>Assistente de Pesquisa</h1>;
      }
    }))
  : lazy(() => import("assistant/App"));

const InstitutionalRemote = import.meta.env.MODE === "test"
  ? lazy(async () => ({
      default: function InstitutionalRemoteTestStub() {
        return <h1>Site Institucional</h1>;
      }
    }))
  : lazy(() => import("institucional/App"));

const writeSession = (user: SessionUser | null) => {
  if (!user) {
    clearPlatformSession();
    return;
  }

  writePlatformSession(user);
};

const toSessionUser = (user: AuthenticatedUser): SessionUser => ({
  id: user.id,
  email: user.email,
  name: user.full_name,
  role: user.role
});

const defaultRouteForRole = () => {
  return APP_ROUTES.admin;
};

function LoginPage({
  onLogin
}: {
  onLogin: (email: string, password: string) => Promise<SessionUser>;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await onLogin(email, password);
      const requestedRoute = (location.state as { from?: string } | null)?.from;
      const redirectTo = requestedRoute && hasAccessToRoute(user.role, requestedRoute)
        ? requestedRoute
        : defaultRouteForRole();
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Não foi possível entrar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="brand-mark" aria-hidden="true" />
        <p className="brand-name">NIAR-Saúde</p>
        <p className="brand-description">Núcleo de Inteligência Artificial Responsável para a Saúde</p>
        <p className="brand-message">
          Pesquisa, inovação e responsabilidade para transformar a saúde com inteligência artificial.
        </p>
      </section>
      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-form-content">
          <Link className="back-to-site" to={APP_ROUTES.home}>
            {"< Voltar ao site institucional"}
          </Link>
          <p className="eyebrow">Acesso à plataforma</p>
          <h1 id="login-title">{APP_TITLES.login}</h1>
          <p className="muted">Use suas credenciais para continuar.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              E-mail
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Senha
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Entrando..." : "Entrar na plataforma"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function RemoteLoading({ label }: { label: string }) {
  return (
    <main className="page">
      <section className="card">
        <p className="muted">Carregando {label}...</p>
      </section>
    </main>
  );
}

export default function App() {
  const location = useLocation();
  const [user, setUser] = useState<SessionUser | null>(() => readPlatformSession());
  const [isRestoringSession, setIsRestoringSession] = useState(() =>
    Boolean(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY))
  );

  useEffect(() => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!token) {
      setIsRestoringSession(false);
      return;
    }

    getCurrentUser(token)
      .then((currentUser) => {
        const sessionUser = toSessionUser(currentUser);
        writePlatformSession(sessionUser);
        setUser(sessionUser);
      })
      .catch(() => writeSession(null))
      .finally(() => setIsRestoringSession(false));
  }, []);

  useEffect(() => {
    const refreshSession = () => setUser(readPlatformSession());
    window.addEventListener(SESSION_CHANGED_EVENT, refreshSession);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, refreshSession);
  }, []);

  const canAccessCurrentRoute = useMemo(() => {
    if (!isProtectedRoute(location.pathname)) {
      return true;
    }

    return hasAccessToRoute(user?.role, location.pathname);
  }, [location.pathname, user?.role]);
  const login = async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, result.token);
    const sessionUser = toSessionUser(result.user);
    writeSession(sessionUser);
    setUser(sessionUser);
    return sessionUser;
  };

  return (
    <div className="layout">
      {isRestoringSession && <RemoteLoading label="sessão" />}

      {!isRestoringSession && !canAccessCurrentRoute && (
        <Navigate replace to={APP_ROUTES.login} state={{ from: location.pathname }} />
      )}

      {!isRestoringSession && <Routes>
        <Route path={APP_ROUTES.login} element={<LoginPage onLogin={login} />} />
        <Route path={`${APP_ROUTES.visualIdentity}/*`} element={<DesignSystemPage />} />
        <Route path="/design-system/*" element={<Navigate replace to={APP_ROUTES.visualIdentity} />} />
        <Route
          path={APP_ROUTES.researcherSignup}
          element={
            <Suspense fallback={<RemoteLoading label="cadastro de pesquisador" />}>
              <AdminRemote mode="public" />
            </Suspense>
          }
        />
        <Route
          path={`${APP_ROUTES.admin}/*`}
          element={
            <ProtectedRoute userRole={user?.role}>
              <Suspense fallback={<RemoteLoading label="área administrativa" />}>
                <AdminRemote />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={`${APP_ROUTES.assistant}/*`}
          element={
            <ProtectedRoute userRole={user?.role}>
              <Suspense fallback={<RemoteLoading label="assistente" />}>
                <AssistantRemote />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <Suspense fallback={<RemoteLoading label="site institucional" />}>
              <InstitutionalRemote />
            </Suspense>
          }
        />
      </Routes>}
    </div>
  );
}
