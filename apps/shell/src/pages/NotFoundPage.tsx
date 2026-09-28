import { SITE_URL } from "../site";

export function NotFoundPage() {
  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">404</p>
        <h1>Página não encontrada</h1>
        <a className="button-link" href={SITE_URL}>
          Voltar ao início
        </a>
      </section>
    </main>
  );
}
