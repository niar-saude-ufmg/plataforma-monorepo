import MuiButton, {
  type ButtonProps as MuiButtonProps,
} from "@mui/material/Button";
import { forwardRef } from "react";

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    inverse: true;
  }

  interface ButtonPropsColorOverrides {
    inverse: true;
  }
}

export type ButtonProps = Omit<MuiButtonProps, "color" | "variant"> & {
  color?: "primary" | "secondary" | "inverse";
  variant?: MuiButtonProps["variant"] | "inverse";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    return <MuiButton ref={ref} {...props} variant={props.variant as MuiButtonProps["variant"]} />;
  },
);
