import Box from "@mui/material/Box";
import type { ChangeEvent, ReactNode } from "react";
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
};

export function Filter({
  search = [], selectableOptions = [], checkedOptions = [], values = {}, onChange,
}: FilterProps) {
  return (
    <Box component="form" aria-label="Filtros" sx={filterRootStyles}>
      <Box sx={filterFieldsStyles}>
        {search.map((field) => <Autocomplete key={`search-${field.key}`} label={field.label} options={field.options} multiple={field.multiple} disabled={field.disabled} value={normalizeAutocompleteValue(values[field.key])} onChange={(_, value) => emitChange(values, onChange, field.key, value)} />)}
        {selectableOptions.map((field) => <Select key={`select-${field.key}`} label={field.label} options={field.options} disabled={field.disabled} value={String(values[field.key] ?? "")} onChange={(event: ChangeEvent<HTMLInputElement>) => emitChange(values, onChange, field.key, event.target.value)} />)}
        {checkedOptions.map((field) => field.type === "radio" ? (
          <Box sx={filterCheckedStyles} key={`radio-${field.key}`}>
            <RadioGroup key={`radio-${field.key}`} label={field.label} options={field.options} row={field.row} value={String(values[field.key] ?? "")} onChange={(event) => emitChange(values, onChange, field.key, event.target.value)} />
          </Box>
        ) : (
          <Box sx={filterCheckedStyles} key={`checkbox-${field.key}`} role="group" aria-label={field.label}>
            {field.options.map((option) => {
              const current = Array.isArray(values[field.key]) ? values[field.key] as string[] : [];
              return <Checkbox key={option.value} label={option.label} checked={current.includes(option.value)} disabled={field.disabled || option.disabled} onChange={(event) => emitChange(values, onChange, field.key, event.target.checked ? [...current, option.value] : current.filter((value) => value !== option.value))} />;
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
function emitChange(values: Readonly<Record<string, unknown>>, onChange: FilterProps["onChange"], key: string, value: unknown) {
  onChange?.({ ...values, [key]: value });
}
function normalizeAutocompleteValue(value: unknown) {
  if (Array.isArray(value)) return [...value] as (AutocompleteOption | string)[];
  return value as AutocompleteOption | string | null | undefined;
}
