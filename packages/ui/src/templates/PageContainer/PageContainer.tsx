import Box from "@mui/material/Box";
import { useEffect, useState, type ReactNode } from "react";
import { PageHeader, type PageHeaderProps } from "../PageHeader/PageHeader";
import {
  pageContainerMainStyles,
  pageContainerHeaderStyles,
  pageContainerRootStyles,
} from "./PageContainer.styles";

const defaultInstitutionalTabs = [
  { label: "Início", value: "home" },
  { label: "Cadastro", value: "register" },
  { label: "Projetos", value: "projects" },
] as const;

export type PageContainerProps = {
  children?: ReactNode | ((state: { activeTab: string }) => ReactNode);
  tabs?: PageHeaderProps["tabs"];
  navigation?: PageHeaderProps["navigation"];
  sidebarItems?: PageHeaderProps["sidebarItems"];
  menuGroups?: PageHeaderProps["menuGroups"];
  showAvatar?: PageHeaderProps["showAvatar"];
  actions?: PageHeaderProps["actions"];
  /** Item de navegação ativo, independentemente de tabs, menu ou sidebar. */
  activeItem?: string;
  /** Chamado quando o usuário escolhe um item de navegação. */
  onItemChange?: (value: string) => void;
};

export function PageContainer({
  children,
  tabs = defaultInstitutionalTabs,
  navigation = "tabs",
  sidebarItems,
  menuGroups,
  showAvatar,
  actions,
  activeItem: controlledActiveItem,
  onItemChange,
}: PageContainerProps) {
  const [internalActiveItem, setInternalActiveItem] = useState<string>(tabs[0]?.value ?? "");
  const [headerVisible, setHeaderVisible] = useState(true);
  const activeItem = controlledActiveItem ?? internalActiveItem;

  const handleItemChange = (value: string) => {
    if (controlledActiveItem === undefined) setInternalActiveItem(value);
    onItemChange?.(value);
  };

  useEffect(() => {
    let previousScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHeaderVisible(currentScrollY <= previousScrollY || currentScrollY < 8);
      previousScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const defaultHeaderProps: PageHeaderProps = {
    navigation,
    tabs,
    sidebarItems,
    menuGroups,
    showAvatar,
    actions,
  };

  return (
    <Box sx={pageContainerRootStyles}>
      <Box sx={{ ...pageContainerHeaderStyles, transform: headerVisible ? "translateY(0)" : "translateY(-100%)" }}>
        <PageHeader {...defaultHeaderProps} onItemChange={handleItemChange} activeItem={activeItem} />
      </Box>
      <Box component="main" sx={pageContainerMainStyles}>
        {typeof children === "function" ? children({ activeTab: activeItem }) : children}
      </Box>
    </Box>
  );
}
