import { niar } from "../../tokens/index";

export const listTextValueStyles = { fontWeight: niar.fontWeight.semibold };

export const listTextLayoutStyles = {
  flexDirection: "column",
  gap: niar.spacing["2xs"],
  gridTemplateColumns: `minmax(${niar.spacing["4xl"]}, 0.7fr) minmax(0, 1.3fr)`,
  width: "100%",
};
