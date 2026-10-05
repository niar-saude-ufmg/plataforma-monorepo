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
import { APP_ROUTES } from "@niar/config";
import { NiarProvider } from "@niar/ui";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { RemoteLoading } from "./components/RemoteLoading/RemoteLoading";
import { LoginPage } from "./pages/Login/Login";
import { NotFoundPage } from "./pages/NotFound/NotFound";
import { InstitutionalRemotePage } from "./remotes/InstitutionalRemotePage";
import { AuthenticatedUser, getCurrentUser, login as loginRequest } from "./services/auth-api";

type SessionUser = PlatformSessionUser;

const AdminRemote = import.meta.env.MODE === "test"
  ? lazy(async () => ({
      default: function AdminRemoteTestStub({ currentUser }: { currentUser?: SessionUser }) {
        return currentUser ? (
          <>
            <h1>Gerenciamento do usuário</h1>
            <p>{currentUser.name}</p>
            <p>{currentUser.email}</p>
            <p>{currentUser.role}</p>
          </>
        ) : <h1>Cadastro de pesquisador</h1>;
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

const INSTITUTIONAL_ROUTES = [
  "/",
  "/about/*",
  "/contact/*",
  "/leme/*",
  "/news/*",
  "/publications/*",
  "/sala-segura/*",
  "/team/*",
  "/en",
  "/en/about/*",
  "/en/contact/*",
  "/en/leme/*",
  "/en/news/*",
  "/en/publications/*",
  "/en/sala-segura/*",
  "/en/team/*"
] as const;

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
    <NiarProvider>
      <div className="layout">
      {isRestoringSession && <RemoteLoading label="sessão" />}

      {!isRestoringSession && !canAccessCurrentRoute && (
        <Navigate replace to={APP_ROUTES.login} state={{ from: location.pathname }} />
      )}

      {!isRestoringSession && <Routes>
        <Route path={APP_ROUTES.login} element={<LoginPage onLogin={login} />} />
        <Route path="/storybook/*" element={<NotFoundPage />} />
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
                <AdminRemote mode="admin" currentUser={user ?? undefined} />
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
        {INSTITUTIONAL_ROUTES.map((path) => (
          <Route key={path} path={path} element={<InstitutionalRemotePage />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>}
      </div>
    </NiarProvider>
  );
}
