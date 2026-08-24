import { Link } from "react-router-dom";
import { APP_ROUTES } from "@niar/config";

export function NotFoundPage() {
  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">404</p>
        <h1>Página não encontrada</h1>
        <Link className="button-link" to={APP_ROUTES.home}>
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
