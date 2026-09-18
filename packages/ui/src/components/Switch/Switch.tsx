import MuiSwitch, {
  type SwitchProps as MuiSwitchProps,
} from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import { niar } from "../../tokens";

export type SwitchProps = MuiSwitchProps & {
  label?: ReactNode;
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch({ label, ...props }, ref) {
    const control = <MuiSwitch ref={ref} {...props} />;

    return label === undefined ? (
      control
    ) : (
      <FormControlLabel
        control={control}
        label={label}
        sx={{ gap: niar.spacing.xs, marginLeft: 0, marginRight: 0 }}
      />
    );
  },
);
