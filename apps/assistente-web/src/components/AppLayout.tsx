import { ReactNode } from 'react';
import { TopNav } from './TopNav';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="app-main">{children}</main>
    </div>
  );
}
