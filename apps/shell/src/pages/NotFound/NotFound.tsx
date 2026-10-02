import { APP_ROUTES } from "@niar/config";
import { Button, Card, PageIntro } from "@niar/ui";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <Card className="not-found-card" variant="outlined">
        <PageIntro
          title="Página não encontrada"
          description="A página que você tentou acessar não existe ou não está disponível."
        />
        <div className="not-found-actions">
          <Button onClick={() => navigate(APP_ROUTES.home)} variant="contained" color="primary">
            Voltar ao início
          </Button>
        </div>
      </Card>
    </main>
  );
}
