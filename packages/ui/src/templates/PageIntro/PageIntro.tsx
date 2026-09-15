import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { Skeleton } from "../../components/Skeleton/Skeleton";
import { pageIntroDescriptionStyles, pageIntroStyles, pageIntroTitleStyles } from "./PageIntro.styles";

export type PageIntroProps = {
  title?: ReactNode;
  description?: ReactNode;
  loading?: boolean;
  "aria-level"?: number;
};

export function PageIntro({ title, description, loading = false, "aria-level": ariaLevel = 1 }: PageIntroProps) {
  return (
    <Box sx={pageIntroStyles}>
      {title && <Typography component="div" role="heading" aria-level={ariaLevel} variant="h1" sx={pageIntroTitleStyles}>{title}</Typography>}
      {loading ? <Skeleton variant="text" lines={1} height={20} width="60%" /> : description && <Typography sx={pageIntroDescriptionStyles}>{description}</Typography>}
    </Box>
  );
}
