import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { MouseEventHandler, ReactNode } from "react";
import {
  footerBottomStyles,
  footerContentStyles,
  footerGridStyles,
  footerHeadingStyles,
  footerLogoStyles,
  footerPartnerStyles,
  footerStyles,
} from "./Footer.styles";

export type FooterProps = {
  logo?: boolean;
  logoAlt?: string;
  logoHref?: string;
  onLogoClick?: MouseEventHandler<HTMLAnchorElement>;
  description?: ReactNode;
  navigation?: ReactNode;
  information?: ReactNode;
  partners?: ReactNode;
  children?: ReactNode;
  copyright?: ReactNode;
  language?: ReactNode;
};

export function Footer({
  logo = true,
  logoAlt = "NIAR-Saúde",
  logoHref = "/",
  onLogoClick,
  description,
  navigation,
  information,
  partners,
  children,
  copyright = "© NIAR-Saúde",
  language,
}: FooterProps) {
  return (
    <Box component="footer" sx={footerStyles}>
      <Box sx={footerContentStyles}>
        <Box>
          <Box component="div" sx={footerLogoStyles}>
            {logo && (
              <a href={logoHref} onClick={onLogoClick} aria-label={logoAlt}>
                <Box
                  component="img"
                  src="/niar-logo-footer.png"
                  alt={logoAlt}
                  sx={{
                    display: "block",
                    filter: "grayscale(1) brightness(0) invert(1)",
                    maxWidth: 180,
                    width: "100%",
                  }}
                />
              </a>
            )}
          </Box>
          {description && <Typography sx={footerHeadingStyles}>{description}</Typography>}
          {children}
        </Box>
        <Box sx={footerGridStyles}>
          {navigation && <Box>{navigation}</Box>}
          {information && <Box>{information}</Box>}
          {partners && <Box sx={footerPartnerStyles}>{partners}</Box>}
        </Box>
      </Box>
      <Box sx={footerBottomStyles}>
        <Typography variant="body2">{copyright}</Typography>
        {language && <Box>{language}</Box>}
      </Box>
    </Box>
  );
}
