import { PageIntro, Tabs } from "@niar/ui";
import { Outlet, useLocation, useNavigate, useResolvedPath } from "react-router-dom";
import "./Settings.scss";

const tabs = [
  { label: "Artefatos FIAR", value: "artefatos-fiar" },
  { label: "Templates de projeto", value: "templates-projeto" },
] as const;

export function Settings() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const settingsPath = useResolvedPath(".").pathname;
  const [category, action] = pathname.slice(settingsPath.length).split("/").filter(Boolean);
  const activeTab = tabs.find(({ value }) => value === category)?.value ?? tabs[0].value;
  const isForm = action === "novo" || action === "editar";
  const options = tabs.map((tab) => ({
    ...tab,
    disabled: isForm && tab.value !== activeTab,
  }));

  return (
    <section className="settings-page" aria-label="Configurações">
      <PageIntro title="Configurações" description="Gerencie os artefatos FIAR e os templates de projeto." />
      <Tabs
        aria-label="Categorias de configurações"
        options={options}
        value={activeTab}
        onChange={(_event, value) => navigate(value)}
      />
      <div className="settings-page__content" role="tabpanel" aria-label={tabs.find(({ value }) => value === activeTab)?.label}>
        <Outlet />
      </div>
    </section>
  );
}
