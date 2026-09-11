import MuiDialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { type ReactNode } from "react";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
export type DialogProps = {
  open: boolean;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  actions?: ReactNode;
  minWidth?: number | string;
};
export function Dialog({
  open,
  title,
  children,
  onClose,
  showCloseButton = true,
  actions,
  minWidth = 360,
}: DialogProps) {
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { minWidth } } }}
    >
      {(title || showCloseButton) && (
        <DialogTitle
          sx={{ position: "relative", pr: showCloseButton ? 7 : undefined }}
        >
          {title || <span className="visually-hidden">Dialog</span>}
          {showCloseButton && (
            <IconButton
              aria-label="Fechar"
              onClick={onClose}
              sx={{ position: "absolute", right: 12, top: 12 }}
            >
              <Close />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </MuiDialog>
  );
}
