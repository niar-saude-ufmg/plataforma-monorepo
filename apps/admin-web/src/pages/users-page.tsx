import { UserForm } from '../components/user-form';

/*
 * Tela principal do admin nesta entrega: cadastro de pesquisador.
 *
 * Atualização de escopo: a listagem de usuários (tabela, loading, erro, vazio)
 * saiu desta tarefa e volta junto da gestão administrativa de usuários.
 * Nenhuma chamada HTTP acontece aqui — a tela só compõe o formulário.
 */
export function UsersPage() {
  return (
    <>
      <header className="page-head">
        <p className="page-head__eyebrow">Administração</p>
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
            <p className="card__hint">O acesso fica pendente até o primeiro login.</p>
          </div>
        </div>
        <div className="card__body">
          <UserForm />
        </div>
      </section>
    </>
  );
}
