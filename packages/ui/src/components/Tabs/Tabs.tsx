import MuiTabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useState } from "react";
export type TabOption = { value: string; label: string; disabled?: boolean };
export type TabsProps = {
  options: readonly TabOption[];
  'aria-label'?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.SyntheticEvent, value: string) => void;
};
export function Tabs({ options, value, defaultValue, onChange, 'aria-label': ariaLabel = 'Navegação por abas' }: TabsProps) {
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? options[0]?.value,
  );
  const selectedValue = value ?? internalValue;
  const handleChange = (event: React.SyntheticEvent, nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(event, nextValue);
  };
  return (
    <MuiTabs value={selectedValue} onChange={handleChange} aria-label={ariaLabel}>
      {options.map((option) => (
        <Tab
          key={option.value}
          value={option.value}
          label={option.label}
          disabled={option.disabled}
        />
      ))}
    </MuiTabs>
  );
}
