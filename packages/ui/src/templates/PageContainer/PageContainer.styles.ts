import { niar } from "../../tokens/index";

export const pageContainerRootStyles = {
  backgroundColor: niar.colors.surface.page,
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
  padding: { xs: `calc(${niar.spacing["3xl"]} + ${niar.spacing.xl}) ${niar.spacing.xl} ${niar.spacing.xl}`, md: `calc(${niar.spacing["4xl"]} + ${niar.spacing.xl}) ${niar.spacing["3xl"]} ${niar.spacing["3xl"]}` },
  width: "100%",
};

export const pageContainerHeaderStyles = {
  position: "fixed",
  top: 0,
  width: "100%",
  zIndex: 1100,
  transition: "transform 180ms ease",
};
