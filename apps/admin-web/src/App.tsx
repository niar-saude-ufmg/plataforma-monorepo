import { UsersPage } from './pages/users-page';

/**
 * Casca do admin. Substitui o placeholder anterior.
 * Quando entrar roteamento (react-router), o <main> vira o outlet das rotas.
 */
export default function App() {
  return (
    <div className="app-shell">
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

      <main className="app-main">
        <UsersPage />
      </main>
    </div>
  );
}
