const catalogUrl = import.meta.env.VITE_DESIGN_SYSTEM_URL
  || (import.meta.env.DEV ? 'http://localhost:6006' : '/storybook/');

export function DesignSystemPage() {
  return (
    <main className="design-system-page">
      <iframe
        className="design-system-frame"
        src={catalogUrl}
        title="Design System NIAR"
      />
    </main>
  );
}
