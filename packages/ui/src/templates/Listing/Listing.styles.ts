import { niar } from "../../tokens/index";

export const listingContentStyles = {
  display: "grid",
  gap: niar.spacing["2xl"],
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
