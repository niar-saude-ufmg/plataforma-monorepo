import { APP_TITLES } from "@niar/config";

const cards = [
  "Cadastro e gestão de usuários",
  "Acompanhamento de projetos",
  "Status, tramitação e envio para comissão"
];

export default function App() {
  return (
    <main className="admin-layout">
      <section className="admin-hero">
        <p className="eyebrow">MVP administrativo</p>
        <h1>{APP_TITLES.admin}</h1>
        <p className="muted">
          Este app concentra o fluxo principal da primeira entrega da plataforma.
        </p>
      </section>

      <section className="card-grid">
        {cards.map((card) => (
          <article className="admin-card" key={card}>
            <h2>{card}</h2>
            <p>Placeholder inicial para implementação gradual das telas e regras do módulo admin.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
