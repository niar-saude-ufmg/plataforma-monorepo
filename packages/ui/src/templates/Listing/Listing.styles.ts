import { niar } from "../../tokens/index";

export const listingContentStyles = {
  boxSizing: "border-box",
  display: "grid",
  gap: niar.spacing.xl,
  minWidth: 0,
  width: "100%",
};

export const listingHeaderStyles = {
  alignItems: "center",
  display: "flex",
  justifyContent: "space-between",
  gap: niar.spacing.lg,
};

export const listingActionSkeletonStyles = {
  flexShrink: 0,
  width: "10rem",
};

export const listingDescriptionSkeletonStyles = {
  width: "min(22rem, 60vw)",
};

export const listingTitleStyles = {
  fontWeight: niar.fontWeight.bold,
};

export const listingDescriptionStyles = {
  color: niar.colors.text.body,
};

export const listingCardStyles = {
  border: `${niar.borderWidth.default} solid ${niar.colors.border}`,
  "& .MuiCardContent-root": {
    padding: niar.spacing["2xl"],
    "&:last-child": { paddingBottom: niar.spacing["2xl"] },
  },
};
