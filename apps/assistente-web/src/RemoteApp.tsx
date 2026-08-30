import { AuthProvider } from './context/AuthContext';
import { AssistantRoutes } from './App';
import './styles.css';

export default function RemoteApp() {
  return (
    <AuthProvider>
      <AssistantRoutes />
    </AuthProvider>
  );
}
