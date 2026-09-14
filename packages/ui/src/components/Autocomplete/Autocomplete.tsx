import MuiAutocomplete, { type AutocompleteProps as MuiAutocompleteProps } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import type { ReactNode } from "react";

export type AutocompleteOption = { label: string; value: string };
export type AutocompleteProps = Omit<MuiAutocompleteProps<AutocompleteOption | string, boolean, false, false>, "options" | "renderInput" | "onChange"> & { options: readonly (AutocompleteOption | string)[]; label?: ReactNode; onChange?: (value: AutocompleteOption | string | (AutocompleteOption | string)[] | null) => void };
export function Autocomplete({ options, label = "Selecionar", onChange, ...props }: AutocompleteProps) {
  const getLabel = (option: AutocompleteOption | string) => typeof option === "string" ? option : option.label;
  return <MuiAutocomplete {...props} options={[...options]} getOptionLabel={getLabel} isOptionEqualToValue={(option, value) => (typeof option === "string" ? option : option.value) === (typeof value === "string" ? value : value.value)} onChange={(_, value) => onChange?.(value)} renderInput={(params) => <TextField {...params} label={label} />} />;
}
