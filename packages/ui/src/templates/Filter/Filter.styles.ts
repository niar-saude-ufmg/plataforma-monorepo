import { niar } from "../../tokens/index";

export const filterRootStyles = {
  width: "100%",
};

export const filterFieldsStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: niar.spacing.md,
};
