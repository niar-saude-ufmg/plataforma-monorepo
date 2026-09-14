import Box from "@mui/material/Box";
import {
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { Avatar } from "../../components/Avatar/Avatar";
import { Header } from "../../components/Header/Header";
import { IconButton } from "../../components/IconButton/IconButton";
import { Menu, type MenuGroup } from "../../components/Menu/Menu";
import { Sidebar, type SidebarItem } from "../../components/Sidebar/Sidebar";
import { Tabs, type TabOption } from "../../components/Tabs/Tabs";
import {
  pageHeaderHeaderContentStyles,
  pageHeaderRootStyles,
} from "./PageHeader.styles";

export type PageHeaderNavigation = "sidebar" | "menu" | "tabs";

export type PageHeaderProps = {
  tabs?: readonly TabOption[];
  tabsValue?: string;
  defaultTabsValue?: string;
  onChange?: (value: string) => void;
  avatar?: ReactNode;
  logo?: boolean;
  logoAlt?: string;
  logoHref?: string;
  onLogoClick?: MouseEventHandler<HTMLAnchorElement>;
  navigation?: PageHeaderNavigation;
  sidebarItems?: readonly SidebarItem[];
  menuGroups?: readonly MenuGroup[];
};

export function PageHeader({
  avatar,
  logo = true,
  logoAlt = "NIAR",
  logoHref = "/",
  onLogoClick,
  navigation = "sidebar",
  sidebarItems = [],
  menuGroups = [],
  tabs,
  tabsValue,
  defaultTabsValue,
  onChange,
}: PageHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const withSidebarClose = (items: readonly SidebarItem[]): SidebarItem[] =>
    items.map((item) => ({
      ...item,
      onClick: () => {
        item.onClick?.();
        onChange?.(item.value ?? item.label);
        if (!item.children?.length) setSidebarOpen(false);
      },
      children: item.children ? withSidebarClose(item.children) : undefined,
    }));
  const sidebarNavigationItems = withSidebarClose(sidebarItems);
  const menuNavigationGroups = menuGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      onClick: (event: Parameters<MouseEventHandler<HTMLElement>>[0]) => {
        item.onClick?.(event);
        onChange?.(item.value ?? String(item.label));
      },
    })),
  }));

  return (
    <Box sx={pageHeaderRootStyles}>
      <Header
        logo={logo}
        logoAlt={logoAlt}
        logoHref={logoHref}
        onLogoClick={onLogoClick}
      >
        <Box sx={pageHeaderHeaderContentStyles}>
          {navigation === "sidebar" && (
            <IconButton
              name="menu"
              aria-label={sidebarOpen ? "Fechar navegação" : "Abrir navegação"}
              onClick={() => setSidebarOpen((open) => !open)}
            />
          )}
          {navigation === "menu" && <Menu groups={menuNavigationGroups} />}
          {navigation === "tabs" && tabs && (
            <Tabs
              options={tabs}
              value={tabsValue}
              defaultValue={defaultTabsValue}
              onChange={(_, value) => onChange?.(value)}
            />
          )}
          {avatar ?? <Avatar alt="Usuário NIAR">UN</Avatar>}
        </Box>
      </Header>

      {navigation === "sidebar" && (
        <Sidebar
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={sidebarNavigationItems}
        />
      )}
    </Box>
  );
}
