import { Loading } from '@niar/ui';
import './RemoteLoading.css';

export function RemoteLoading({ label }: { label: string }) {
  return (
    <main className="remote-loading" aria-busy="true">
      <div
        className="remote-loading__content"
        role="status"
        aria-label={`Carregando ${label}`}
      >
        <Loading variant="circular" size={40} aria-label={`Carregando ${label}`} />
        <p>Carregando {label}...</p>
      </div>
    </main>
  );
}
