import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Card } from "../../components/Card/Card";
import {
  formDescriptionStyles,
  formHeaderStyles,
  formRootStyles,
  formTitleStyles,
} from "./Form.styles";

export type FormProps = {
  title?: ReactNode;
  description?: ReactNode;
  "aria-level"?: number;
  children?: ReactNode;
};

export function Form({ title, description, "aria-level": ariaLevel = 1, children }: FormProps) {
  return (
    <Box sx={formRootStyles}>
      {(title || description) && <Box sx={formHeaderStyles}>
        {title && <Typography sx={formTitleStyles} component="div" role="heading" aria-level={ariaLevel} variant="h1">{title}</Typography>}
        {description && <Typography sx={formDescriptionStyles}>{description}</Typography>}
      </Box>}
      <Card variant="outlined">{children}</Card>
    </Box>
  );
}
