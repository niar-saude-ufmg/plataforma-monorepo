import MuiAutocomplete, {
  type AutocompleteChangeDetails,
  type AutocompleteChangeReason,
  type AutocompleteProps as MuiAutocompleteProps,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import type { ReactNode, SyntheticEvent } from "react";

export type AutocompleteOption = { label: string; value: string };
export type AutocompleteValue =
  AutocompleteOption | string | readonly (AutocompleteOption | string)[] | null;
export type AutocompleteProps = Omit<
  MuiAutocompleteProps<AutocompleteOption | string, boolean, false, false>,
  "options" | "renderInput" | "onChange"
> & {
  options: readonly (AutocompleteOption | string)[];
  label?: ReactNode;
  onChange?: (
    event: SyntheticEvent,
    value: AutocompleteValue,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<AutocompleteOption | string>,
  ) => void;
};
export function Autocomplete({
  options,
  label = "Selecionar",
  onChange,
  ...props
}: AutocompleteProps) {
  const getLabel = (option: AutocompleteOption | string) =>
    typeof option === "string" ? option : option.label;
  return (
    <MuiAutocomplete
      {...props}
      options={[...options]}
      getOptionLabel={getLabel}
      isOptionEqualToValue={(option, value) =>
        (typeof option === "string" ? option : option.value) ===
        (typeof value === "string" ? value : value.value)
      }
      onChange={(event, value, reason, details) =>
        onChange?.(event, value, reason, details)
      }
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}
