import { APP_ROUTES } from '@niar/config';
import { USER_ROLE_LABELS, type UserRole } from '@niar/contracts';
import { UserForm } from '../components/user-form';

type UsersPageProps = {
  mode?: 'admin' | 'public';
  currentUser?: {
    name: string;
    email: string;
    role: UserRole;
  };
};

/*
 * Tela principal do admin nesta entrega: cadastro de pesquisador.
 *
 * Atualização de escopo: a listagem de usuários (tabela, loading, erro, vazio)
 * saiu desta tarefa e volta junto da gestão administrativa de usuários.
 * Nenhuma chamada HTTP acontece aqui — a tela só compõe o formulário.
 */
export function UsersPage({ mode = 'admin', currentUser }: UsersPageProps) {
  const isPublicMode = mode === 'public';

  function handleCreated() {
    if (!isPublicMode || typeof window === 'undefined') {
      return;
    }

    window.location.assign(APP_ROUTES.salaSegura);
  }

  if (!isPublicMode && currentUser) {
    return (
      <div className="users-page">
        <header className="page-head">
          <p className="page-head__eyebrow">Minha conta</p>
          <h1 className="page-head__title">Gerenciamento do usuário</h1>
          <p className="page-head__subtitle">
            Consulte os dados da sua conta e acesse, nas próximas etapas, as funções disponíveis para o seu perfil.
          </p>
        </header>

        <section className="card" aria-labelledby="current-user-title">
          <div className="card__head">
            <div>
              <h2 className="card__title" id="current-user-title">Usuário autenticado</h2>
              <p className="card__hint">Estas são as informações da sessão atual.</p>
            </div>
          </div>
          <dl className="user-summary">
            <div className="user-summary__item">
              <dt>Nome</dt>
              <dd>{currentUser.name}</dd>
            </div>
            <div className="user-summary__item">
              <dt>E-mail</dt>
              <dd>{currentUser.email}</dd>
            </div>
            <div className="user-summary__item">
              <dt>Tipo de usuário</dt>
              <dd><span className="pill pill--role">{USER_ROLE_LABELS[currentUser.role]}</span></dd>
            </div>
          </dl>
        </section>
      </div>
    );
  }

  return (
    <div className={isPublicMode ? 'users-page users-page--public' : 'users-page'}>
      <header className="page-head">
        {isPublicMode ? (
          <a className="page-head__back-link" href={APP_ROUTES.salaSegura}>
            {'< Voltar para a Sala Segura'}
          </a>
        ) : null}
        {!isPublicMode ? <p className="page-head__eyebrow">Administração</p> : null}
        <h1 className="page-head__title">Cadastro de pesquisador</h1>
        <p className="page-head__subtitle">
          Cadastre pesquisadores com acesso à plataforma. O perfil de pesquisador dá acesso aos
          dados de pesquisa e aos resultados dos modelos.
        </p>
      </header>

      <section className="card" aria-labelledby="new-user-title">
        <div className="card__head">
          <div>
            <h2 className="card__title" id="new-user-title">
              Novo pesquisador
            </h2>
          </div>
        </div>
        <div className="card__body">
          <UserForm onCreated={handleCreated} />
        </div>
      </section>
    </div>
  );
}
