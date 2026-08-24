import { Link } from "react-router-dom";
import { APP_ROUTES } from "@niar/config";

export function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Rota pública</p>
        <h1>Plataforma NIAR</h1>
        <p className="muted">
          Esta shell organiza rotas, autenticação e a entrada para os micros do ecossistema.
        </p>
        <div className="hero-actions">
          <Link className="button-link" to={APP_ROUTES.login}>
            Fazer login
          </Link>
          <Link className="button-link secondary" to={APP_ROUTES.admin}>
            Ver área admin
          </Link>
        </div>
      </section>
    </main>
  );
}
