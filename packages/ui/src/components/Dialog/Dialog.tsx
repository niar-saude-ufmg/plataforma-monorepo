import MuiDialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { type ReactNode } from "react";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import { niar } from "../../tokens";
export type DialogProps = {
  open: boolean;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  actions?: ReactNode;
  minWidth?: number | string;
  closeLabel?: string;
  "aria-label"?: string;
};
export function Dialog({
  open,
  title,
  children,
  onClose,
  showCloseButton = true,
  closeOnBackdropClick = true,
  disableEscapeKeyDown = false,
  actions,
  minWidth = 360,
  closeLabel = "Fechar",
  "aria-label": ariaLabel = "Dialog",
}: DialogProps) {
  const requestedMinWidth = typeof minWidth === "number" ? `${minWidth}px` : minWidth;

  return (
    <MuiDialog
      open={open}
      onClose={(_event, reason) => {
        if (reason === "backdropClick" && !closeOnBackdropClick) return;
        if (reason === "escapeKeyDown" && disableEscapeKeyDown) return;
        onClose?.();
      }}
      aria-label={ariaLabel}
      slotProps={{
        paper: {
          sx: {
            minWidth: `min(${requestedMinWidth}, calc(100vw - ${niar.spacing["2xl"]}))`,
            margin: { xs: niar.spacing.md, sm: niar.spacing["2xl"] },
          },
        },
      }}
    >
      {(title || showCloseButton) && (
        <DialogTitle
          variant="h2"
          sx={{ position: "relative", pr: showCloseButton ? 7 : undefined }}
        >
          {title || <span className="visually-hidden">{ariaLabel}</span>}
          {showCloseButton && (
            <IconButton
              aria-label={closeLabel}
              onClick={onClose}
              sx={{
                position: "absolute",
                right: niar.spacing.sm,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <Close />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      {actions && (
        <DialogActions sx={{ px: niar.spacing.xl, pb: niar.spacing.md }}>
          {actions}
        </DialogActions>
      )}
    </MuiDialog>
  );
}
