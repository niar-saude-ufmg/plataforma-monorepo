import { AuthProvider } from './context/AuthContext';
import { Provider } from 'react-redux';
import { AssistantRoutes } from './App';
import { store } from './store';
import './styles.css';

export default function RemoteApp() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AssistantRoutes />
      </AuthProvider>
    </Provider>
  );
}
