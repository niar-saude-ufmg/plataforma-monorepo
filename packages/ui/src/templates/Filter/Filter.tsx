import Box from "@mui/material/Box";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { Autocomplete, type AutocompleteOption } from "../../components/Autocomplete/Autocomplete";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import { RadioGroup, type RadioGroupOption } from "../../components/RadioGroup/RadioGroup";
import { Select } from "../../components/Select/Select";
import {
  filterCheckedStyles,
  filterFieldsStyles,
  filterRootStyles,
} from "./Filter.styles";

export type FilterSearchField = {
  key: string;
  label: ReactNode;
  options: readonly (AutocompleteOption | string)[];
  multiple?: boolean;
  disabled?: boolean;
};
export type FilterSelectableField = {
  key: string;
  label: string;
  options: readonly { value: string; label: string; disabled?: boolean }[];
  disabled?: boolean;
};
export type FilterCheckedField = {
  key: string;
  label: string;
  type: "checkbox" | "radio";
  options: readonly RadioGroupOption[];
  row?: boolean;
  disabled?: boolean;
};
export type FilterProps = {
  search?: readonly FilterSearchField[];
  selectableOptions?: readonly FilterSelectableField[];
  checkedOptions?: readonly FilterCheckedField[];
  values?: Readonly<Record<string, unknown>>;
  onChange?: (values: Readonly<Record<string, unknown>>) => void;
  "aria-label"?: string;
};

export function Filter({
  search = [], selectableOptions = [], checkedOptions = [], values, onChange, "aria-label": ariaLabel = "Filtros",
}: FilterProps) {
  const [internalValues, setInternalValues] = useState<Readonly<Record<string, unknown>>>({});
  const currentValues = values ?? internalValues;

  function handleChange(key: string, value: unknown) {
    const nextValues = { ...currentValues, [key]: value };
    if (values === undefined) {
      setInternalValues(nextValues);
    }
    onChange?.(nextValues);
  }

  return (
    <Box component="form" aria-label={ariaLabel} sx={filterRootStyles}>
      <Box sx={filterFieldsStyles}>
        {search.map((field) => <Autocomplete key={`search-${field.key}`} label={field.label} options={field.options} multiple={field.multiple} disabled={field.disabled} value={normalizeAutocompleteValue(currentValues[field.key])} onChange={(_, value) => handleChange(field.key, value)} />)}
        {selectableOptions.map((field) => <Select key={`select-${field.key}`} label={field.label} options={field.options} disabled={field.disabled} value={String(currentValues[field.key] ?? "")} onChange={(event: ChangeEvent<HTMLInputElement>) => handleChange(field.key, event.target.value)} />)}
        {checkedOptions.map((field) => field.type === "radio" ? (
          <Box sx={filterCheckedStyles} key={`radio-${field.key}`}>
            <RadioGroup key={`radio-${field.key}`} label={field.label} options={field.options} row={field.row} value={String(currentValues[field.key] ?? "")} onChange={(event) => handleChange(field.key, event.target.value)} />
          </Box>
        ) : (
          <Box sx={filterCheckedStyles} key={`checkbox-${field.key}`} role="group" aria-label={field.label}>
            {field.options.map((option) => {
              const current = Array.isArray(currentValues[field.key]) ? currentValues[field.key] as string[] : [];
              return <Checkbox key={option.value} label={option.label} checked={current.includes(option.value)} disabled={field.disabled || option.disabled} onChange={(event) => handleChange(field.key, event.target.checked ? [...current, option.value] : current.filter((value) => value !== option.value))} />;
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
function normalizeAutocompleteValue(value: unknown) {
  if (Array.isArray(value)) return [...value] as (AutocompleteOption | string)[];
  return value as AutocompleteOption | string | null | undefined;
}
