import { niar } from "../../tokens/index";
export const formRootStyles = { boxSizing: "border-box", display: "grid", gap: niar.spacing.xl, maxWidth: "100%", width: "100%" };
export const formHeaderStyles = { display: "grid", gap: niar.spacing.xs };
export const formTitleStyles = { fontWeight: niar.fontWeight.bold };
export const formDescriptionStyles = { color: niar.colors.text.body };
export const formCardStyles = { "& .MuiCardContent-root": { padding: niar.spacing["2xl"], "&:last-child": { paddingBottom: niar.spacing["2xl"] } } };
