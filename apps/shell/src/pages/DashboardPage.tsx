export function DashboardPage({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Área protegida</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </section>
    </main>
  );
}
