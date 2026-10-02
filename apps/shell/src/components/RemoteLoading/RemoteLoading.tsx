import { Card, Skeleton } from '@niar/ui';
import './RemoteLoading.css';

export function RemoteLoading({ label }: { label: string }) {
  return (
    <main className="remote-loading" aria-busy="true">
      <div className="remote-loading__content">
        <div className="remote-loading__intro">
          <Skeleton
            variant="text"
            lines={1}
            height={48}
            width="62%"
            aria-label={`Carregando ${label}`}
          />
          <Skeleton
            variant="text"
            lines={2}
            height={20}
            width="82%"
            aria-label={`Carregando descrição de ${label}`}
          />
        </div>

        <Card className="remote-loading__card" variant="outlined">
          <div className="remote-loading__form">
            <section className="remote-loading__section">
              <Skeleton variant="text" lines={1} height={28} width="28%" />
              <div className="remote-loading__field-grid">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} variant="rounded" lines={1} height={56} />
                ))}
              </div>
            </section>

            <section className="remote-loading__section">
              <Skeleton variant="text" lines={1} height={28} width="42%" />
              <div className="remote-loading__field-grid">
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} variant="rounded" lines={1} height={56} />
                ))}
              </div>
            </section>

            <section className="remote-loading__section">
              <Skeleton variant="text" lines={1} height={28} width="24%" />
              <div className="remote-loading__field-grid remote-loading__field-grid--three">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} variant="rounded" lines={1} height={56} />
                ))}
              </div>
              <Skeleton variant="rounded" lines={1} height={96} />
            </section>
          </div>
        </Card>
      </div>
    </main>
  );
}
