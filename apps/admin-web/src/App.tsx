import { NiarProvider } from '@niar/ui';
import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PublicUser } from './pages/PublicUser/PublicUser';
import { store } from './store';
import { selectAuthUser, setAuthUser } from './store/auth/auth.slice';
import type { AuthUser } from './types/user.types';
import './styles/niar.css';

type AppProps = {
  mode?: 'admin' | 'public';
  currentUser?: AuthUser;
};

function AppContent({ mode, currentUser }: AppProps) {
  const dispatch = useDispatch();
  const authUser = useSelector(selectAuthUser);
  const isPublicMode = mode === 'public';

  useEffect(() => {
    dispatch(setAuthUser(currentUser ?? null));
  }, [currentUser, dispatch]);

  return (
    <div className="app-shell">
      <main className={isPublicMode ? 'app-main app-main--public' : 'app-main'}>
        <PublicUser mode={mode} currentUser={authUser ?? undefined} />
      </main>
    </div>
  );
}

/**
 * Casca do admin. Substitui o placeholder anterior.
 * Quando entrar roteamento (react-router), o <main> vira o outlet das rotas.
 */
export default function App({ mode = 'admin', currentUser }: AppProps) {
  return (
    <NiarProvider>
      <Provider store={store}>
        <AppContent mode={mode} currentUser={currentUser} />
      </Provider>
    </NiarProvider>
  );
}
