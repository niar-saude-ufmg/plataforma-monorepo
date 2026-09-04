import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UsersPage } from './pages/users-page';
import './styles/niar.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type AppProps = {
  mode?: 'admin' | 'public';
};

/**
 * Casca do admin. Substitui o placeholder anterior.
 * Quando entrar roteamento (react-router), o <main> vira o outlet das rotas.
 */
export default function App({ mode = 'admin' }: AppProps) {
  const isPublicMode = mode === 'public';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-shell">
        {!isPublicMode ? (
          <header className="app-header">
            <div className="app-header__inner">
              {/* TODO: trocar por <img src="/logo-niar-saude.svg" alt="NIAR-Saúde" />.
                  O manual não permite recriar a marca com outra tipografia em produção. */}
              <div className="brand">
                <span className="brand__mark">NIAR-Saúde</span>
                <span className="brand__descriptor">
                  Núcleo de Inteligência Artificial Responsável para a Saúde
                </span>
              </div>
              <span className="app-header__meta">Painel administrativo</span>
            </div>
          </header>
        ) : null}

        <main className={isPublicMode ? 'app-main app-main--public' : 'app-main'}>
          <UsersPage mode={mode} />
        </main>
      </div>
    </QueryClientProvider>
  );
}
