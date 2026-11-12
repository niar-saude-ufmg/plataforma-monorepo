import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

type AdminMemoryRouterProps = {
  children: ReactElement;
  initialEntries: string[];
};

export function AdminMemoryRouter({ children, initialEntries }: AdminMemoryRouterProps) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/admin/*" element={children} />
      </Routes>
    </MemoryRouter>
  );
}
