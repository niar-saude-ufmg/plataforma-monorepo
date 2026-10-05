import { NiarProvider } from '@niar/ui';
import { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PublicUser } from './pages/PublicUser/PublicUser';
import { AdminRoutes } from './routes/AdminRoutes';
import { store } from './store';
import { setAuthUser } from './store/auth/auth.slice';
import type { AuthUser } from './types/user.types';
import './styles/niar.css';

type AppProps = {
  mode?: 'admin' | 'public';
  currentUser?: AuthUser;
};

function AppContent({ mode, currentUser }: AppProps) {
  const dispatch = useDispatch();
  const isPublicMode = mode === 'public';
  const [isAuthReady, setIsAuthReady] = useState(isPublicMode);

  useEffect(() => {
    dispatch(setAuthUser(currentUser ?? null));
    setIsAuthReady(true);
  }, [currentUser, dispatch]);

  if (!isPublicMode && !isAuthReady) return null;

  return (
    <div className="app-shell">
      {isPublicMode ? (
        <main className="app-main app-main--public">
          <PublicUser />
        </main>
      ) : <AdminRoutes />}
    </div>
  );
}

/**
 * Casca do admin. Substitui o placeholder anterior.
 * Quando entrar roteamento (react-router), o <main> vira o outlet das rotas.
 */
export default function App({ mode = 'public', currentUser }: AppProps) {
  return (
    <NiarProvider>
      <Provider store={store}>
        <AppContent mode={mode} currentUser={currentUser} />
      </Provider>
    </NiarProvider>
  );
}
