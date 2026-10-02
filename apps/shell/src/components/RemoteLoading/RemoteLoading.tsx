import { Card, Loading, PageIntro } from '@niar/ui';
import './RemoteLoading.css';

export function RemoteLoading({ label }: { label: string }) {
  return (
    <main className="remote-loading">
      <Card className="remote-loading__card" variant="outlined">
        <div className="remote-loading__content">
          <Loading aria-label={`Carregando ${label}`} />
          <PageIntro title={`Carregando ${label}...`} />
        </div>
      </Card>
    </main>
  );
}
