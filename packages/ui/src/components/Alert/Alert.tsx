import MuiAlert, {
  type AlertProps as MuiAlertProps,
} from "@mui/material/Alert";
import { forwardRef } from "react";

export type AlertProps = MuiAlertProps;

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert(props, ref) {
    return <MuiAlert ref={ref} {...props} />;
  },
);
