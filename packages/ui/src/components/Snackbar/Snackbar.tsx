import MuiSnackbar, {
  type SnackbarProps as MuiSnackbarProps,
} from "@mui/material/Snackbar";
import MuiAlert, {
  type AlertProps as MuiAlertProps,
} from "@mui/material/Alert";
import { forwardRef } from "react";

export type SnackbarProps = Omit<MuiSnackbarProps, "children"> & {
  message: string;
  severity?: MuiAlertProps["severity"];
  variant?: MuiAlertProps["variant"];
};
export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(
  function Snackbar({
    message,
    severity = "info",
    variant = "standard",
    autoHideDuration = 6000,
    onClose,
    ...props
  }, ref) {
    return (
      <MuiSnackbar
        ref={ref}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        {...props}
      >
        <MuiAlert
          severity={severity}
          variant={variant}
          onClose={onClose ? (event) => onClose(event, "clickaway") : undefined}
        >
          {message}
        </MuiAlert>
      </MuiSnackbar>
    );
  },
);
