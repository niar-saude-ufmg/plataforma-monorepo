import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div className="page">
      <header className="page-intro">
        <h1>Assistente de Pesquisa em Saúde</h1>
        <p className="muted">Documente projetos de ciência de dados em saúde e gere scripts de engenharia de dados.</p>
      </header>

      <div className="dashboard-grid">
        <Link to="/projects/new" className="dashboard-card">
          <h2>Documento do Projeto</h2>
          <p>
            Documente seu estudo, exporte o project.docx e conclua com a engenharia de dados vinculada
            (script data_clean.py).
          </p>
          <span className="card-action">Iniciar assistente →</span>
        </Link>
      </div>

      <div className="dashboard-links">
        <Link to="/projects">Ver sessões de projeto</Link>
      </div>
    </div>
  );
}
