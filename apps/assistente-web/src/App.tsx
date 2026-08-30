import { Navigate, Route, Routes } from 'react-router-dom';
import { APP_ROUTES } from '@niar/config';
import { AppLayout } from './components/AppLayout';
import { useAuth } from './context/AuthContext';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import DocWizardPage from './pages/DocWizardPage';
import InformacoesPage from './pages/InformacoesPage';
import ProfilePage from './pages/ProfilePage';
import ProjectListPage from './pages/ProjectListPage';
import { assistantRoute } from './routes';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page"><p>Carregando...</p></div>;
  if (!user) return <Navigate to={APP_ROUTES.login} replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to={assistantRoute()} replace />;
  return <>{children}</>;
}

export function AssistantRoutes() {
  const { loading } = useAuth();

  if (loading) return <div className="page"><p>Carregando...</p></div>;

  return (
    <Routes>
      <Route index element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="projects" element={<PrivateRoute><ProjectListPage /></PrivateRoute>} />
      <Route path="projects/:id" element={<PrivateRoute><DocWizardPage /></PrivateRoute>} />
      <Route path="perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="informacoes" element={<PrivateRoute><InformacoesPage /></PrivateRoute>} />
      <Route path="projects/:id/workspace" element={<Navigate to=".." replace />} />
      <Route path="cleaning" element={<Navigate to={assistantRoute('/projects')} replace />} />
      <Route path="cleaning/:id" element={<Navigate to={assistantRoute('/projects')} replace />} />
      <Route path="admin" element={<PrivateRoute><AdminRoute><AdminPage /></AdminRoute></PrivateRoute>} />
      <Route path="*" element={<Navigate to={assistantRoute()} replace />} />
    </Routes>
  );
}
