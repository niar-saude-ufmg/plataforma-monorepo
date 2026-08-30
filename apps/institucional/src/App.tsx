import { Link, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "@niar/config";

function Header() {
  return (
    <header className="site-header">
      <Link aria-label="NIAR-Saúde: página inicial" className="brand" to={APP_ROUTES.home}>
        <span aria-hidden="true" className="brand-mark">N</span>
        <span><strong>NIAR-Saúde</strong><small>Núcleo de Inteligência Artificial Responsável para a Saúde</small></span>
      </Link>
      <nav aria-label="Navegação principal" className="site-nav">
        <Link to={APP_ROUTES.salaSegura}>Saiba sobre Sala Segura</Link>
        <Link className="login-link" to={APP_ROUTES.login}>Login</Link>
      </nav>
    </header>
  );
}

function HomePage() {
  return <main className="page hero"><div><p className="eyebrow">NIAR-Saúde</p><h1>Inteligência artificial responsável para transformar a saúde.</h1><p>Conheça o ambiente de pesquisa do NIAR e o caminho para submeter, acompanhar e evoluir projetos com segurança e governança.</p><Link className="primary-action" to={APP_ROUTES.salaSegura}>Saiba sobre Sala Segura</Link></div><aside><span>01</span><h2>Pesquisa com um fluxo claro</h2><p>Da preparação do projeto ao acompanhamento de cada etapa pela plataforma.</p></aside></main>;
}

function SalaSeguraPage() {
  return <main className="page room"><div><p className="eyebrow">Sala Segura</p><h1>Um ambiente orientado para pesquisas que exigem governança.</h1><p>A plataforma organiza a preparação, submissão e acompanhamento de projetos de pesquisa que seguem para análise do NIAR.</p><p className="supporting-copy">Use o assistente para estruturar seu projeto ou acompanhe as próximas etapas depois da avaliação da comissão.</p></div><section aria-label="Opções de acesso" className="access-options"><article><h2>Cadastre-se como pesquisador</h2><p>Crie sua conta para iniciar a preparação do seu projeto.</p><Link className="secondary-action" to="/cadastro/pesquisador">Cadastrar-se como pesquisador</Link></article><article className="emphasis"><h2>Acesse o assistente</h2><p>Entre com suas credenciais para iniciar ou continuar a preparação do projeto.</p><Link className="primary-action" to={APP_ROUTES.assistant}>Usar o assistente</Link></article></section></main>;
}

function NotFoundPage() {
  return <main className="not-found"><p className="eyebrow">404</p><h1>Página não encontrada</h1><Link className="primary-action" to={APP_ROUTES.home}>Voltar ao início</Link></main>;
}

export default function App() {
  return <div className="institutional-app"><Header /><Routes><Route index element={<HomePage />} /><Route path="sala-segura" element={<SalaSeguraPage />} /><Route path="*" element={<NotFoundPage />} /></Routes></div>;
}
