import { niar } from "../../tokens/index";
import { alpha } from "@mui/material/styles";

export const footerStyles = {
  backgroundColor: niar.colors.brand.deep,
  color: niar.colors.surface.card,
  display: "flex",
  flexDirection: "column",
  fontFamily: niar.fontFamily,
  width: "100%",
  "& .MuiTypography-root": {
    color: niar.colors.surface.card,
  },
  "& .MuiTypography-overline": {
    color: alpha(niar.colors.surface.card, 0.64),
    fontSize: niar.fontSize.caption,
    fontWeight: niar.fontWeight.bold,
    letterSpacing: "0.04em",
  },
  "& .MuiTypography-body1, & .MuiLink-root": {
    fontSize: niar.fontSize.body,
  },
};

export const footerContentStyles = {
  display: "grid",
  gap: niar.spacing["3xl"],
  gridTemplateColumns: { xs: "1fr", md: "minmax(0, 0.95fr) minmax(0, 1.45fr)" },
  padding: { xs: niar.spacing.xl, md: niar.spacing["2xl"] },
};

export const footerLogoStyles = {
  alignItems: "center",
  display: "flex",
  minHeight: niar.spacing["3xl"],
};

export const footerHeadingStyles = {
  color: niar.colors.surface.card,
  fontSize: niar.fontSize.body,
  lineHeight: 1.6,
  marginTop: niar.spacing.sm,
  maxWidth: "360px",
};

export const footerGridStyles = {
  display: "grid",
  gap: niar.spacing["2xl"],
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
};

export const footerPartnerStyles = {
  gridColumn: { xs: "auto", sm: "1 / -1" },
};

export const footerBottomStyles = {
  alignItems: "center",
  borderTop: `${niar.borderWidth.default} solid ${alpha(niar.colors.surface.card, 0.2)}`,
  color: niar.colors.surface.card,
  display: "flex",
  justifyContent: "space-between",
  padding: `${niar.spacing.md} ${niar.spacing["2xl"]}`,
  "& .MuiTypography-body2": {
    color: alpha(niar.colors.surface.card, 0.64),
  },
};
