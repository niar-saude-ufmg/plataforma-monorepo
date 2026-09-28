import { Link } from "react-router-dom";
import { APP_ROUTES } from "@niar/config";
import { SITE_URL } from "../site";
import "./SalaSeguraPage.css";

export function SalaSeguraPage() {
  return (
    <div className="sala-segura">
      <header className="ss-header">
        <a aria-label="NIAR-Saúde: site institucional" className="ss-brand" href={SITE_URL}>
          <span aria-hidden="true" className="ss-brand-mark">N</span>
          <span>
            <strong>NIAR-Saúde</strong>
            <small>Núcleo de Inteligência Artificial Responsável para a Saúde</small>
          </span>
        </a>
        <nav aria-label="Navegação principal" className="ss-nav">
          <Link className="ss-login-link" to={APP_ROUTES.login}>Login</Link>
        </nav>
      </header>
      <main className="ss-main">
        <div>
          <p className="ss-eyebrow">Sala Segura</p>
          <h1>Um ambiente orientado para pesquisas que exigem governança.</h1>
          <p>
            A plataforma organiza a preparação, submissão e acompanhamento de projetos de pesquisa
            que seguem para análise do NIAR.
          </p>
          <p className="ss-supporting-copy">
            Use o assistente para estruturar seu projeto ou acompanhe as próximas etapas depois da
            avaliação da comissão.
          </p>
        </div>
        <section aria-label="Opções de acesso" className="ss-access-options">
          <article>
            <h2>Cadastre-se como pesquisador</h2>
            <p>Crie sua conta para iniciar a preparação do seu projeto.</p>
            <Link className="ss-secondary-action" to={APP_ROUTES.researcherSignup}>
              Cadastrar-se como pesquisador
            </Link>
          </article>
          <article className="ss-emphasis">
            <h2>Acesse o assistente</h2>
            <p>Entre com suas credenciais para iniciar ou continuar a preparação do projeto.</p>
            <Link className="ss-primary-action" to={APP_ROUTES.assistant}>Usar o assistente</Link>
          </article>
        </section>
      </main>
    </div>
  );
}
