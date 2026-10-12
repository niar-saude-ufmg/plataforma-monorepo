import { niar } from "../../tokens/index";

const headerHeight = `calc(${niar.spacing["4xl"]} + ${niar.spacing.xs})`;

export const pageContainerRootStyles = {
  backgroundColor: niar.colors.surface.light,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  width: "100%",
};

export const pageContainerMainStyles = {
  boxSizing: "border-box",
  flex: 1,
  minWidth: 0,
  padding: { xs: `${headerHeight} ${niar.spacing.xl} ${niar.spacing.xl}`, md: `${headerHeight} ${niar.spacing["3xl"]} ${niar.spacing["3xl"]}` },
  width: "100%",
};

export const pageContainerHeaderStyles = {
  position: "fixed",
  top: 0,
  width: "100%",
  zIndex: 1100,
  transition: "transform 180ms ease",
};
