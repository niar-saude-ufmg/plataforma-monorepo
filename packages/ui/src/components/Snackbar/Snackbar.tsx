import MuiSnackbar, {
  type SnackbarProps as MuiSnackbarProps,
} from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { forwardRef } from "react";
export type SnackbarProps = Omit<MuiSnackbarProps, "children"> & {
  message: string;
  severity?: "success" | "info" | "warning" | "error";
};
export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(
  function Snackbar({ message, severity = "info", ...props }, ref) {
    return (
      <MuiSnackbar ref={ref} {...props}>
        <Alert
          severity={severity}
          variant="filled"
          sx={{
            backgroundColor: {
              success: "#176b4d",
              info: "#1c355e",
              warning: "#765400",
              error: "#9b2c2c",
            }[severity],
            color: "#fff",
          }}
        >
          {message}
        </Alert>
      </MuiSnackbar>
    );
  },
);
