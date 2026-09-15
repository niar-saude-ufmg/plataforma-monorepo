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
};

export function PageContainer({ children }: PageContainerProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultInstitutionalTabs[0].value);
  const [headerVisible, setHeaderVisible] = useState(true);

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
    navigation: "tabs",
    tabs: defaultInstitutionalTabs,
  };

  return (
    <Box sx={pageContainerRootStyles}>
      <Box sx={{ ...pageContainerHeaderStyles, transform: headerVisible ? "translateY(0)" : "translateY(-100%)" }}>
        <PageHeader {...defaultHeaderProps} onChange={(value) => setActiveTab(value)} tabsValue={activeTab} />
      </Box>
      <Box component="main" sx={pageContainerMainStyles}>
        {typeof children === "function" ? children({ activeTab }) : children}
      </Box>
    </Box>
  );
}
