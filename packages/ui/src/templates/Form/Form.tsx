import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { Card } from "../../components/Card/Card";
import { PageIntro } from "../PageIntro/PageIntro";
import {
  formCardStyles,
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
      {(title || description) && <Box sx={formHeaderStyles}><PageIntro title={title} description={description} aria-level={ariaLevel} /></Box>}
      <Card variant="outlined" sx={formCardStyles}>{children}</Card>
    </Box>
  );
}
