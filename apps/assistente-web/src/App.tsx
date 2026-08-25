import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { useAuth } from './context/AuthContext';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import DocWizardPage from './pages/DocWizardPage';
import InformacoesPage from './pages/InformacoesPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProjectListPage from './pages/ProjectListPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page"><p>Carregando...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="page"><p>Carregando...</p></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute><ProjectListPage /></PrivateRoute>} />
      <Route path="/projects/:id" element={<PrivateRoute><DocWizardPage /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/informacoes" element={<PrivateRoute><InformacoesPage /></PrivateRoute>} />
      <Route path="/projects/:id/workspace" element={<Navigate to=".." replace />} />
      <Route path="/cleaning" element={<Navigate to="/projects" replace />} />
      <Route path="/cleaning/:id" element={<Navigate to="/projects" replace />} />
      <Route path="/admin" element={<PrivateRoute><AdminRoute><AdminPage /></AdminRoute></PrivateRoute>} />
    </Routes>
  );
}
