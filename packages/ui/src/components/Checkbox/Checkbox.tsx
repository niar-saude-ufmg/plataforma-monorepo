import MuiCheckbox, {
  type CheckboxProps as MuiCheckboxProps,
} from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { forwardRef } from "react";
export type CheckboxProps = MuiCheckboxProps & { label?: React.ReactNode };
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox({ label, ...props }, ref) {
    const control = <MuiCheckbox ref={ref} {...props} />;
    return label === undefined ? (
      control
    ) : (
      <FormControlLabel control={control} label={label} />
    );
  },
);
