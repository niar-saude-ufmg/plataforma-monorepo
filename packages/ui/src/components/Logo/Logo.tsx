import type { ImgHTMLAttributes } from "react";
import { niar } from "../../tokens";

export type LogoVariant = "default" | "inverse";

export type LogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "style"> & {
  variant?: LogoVariant;
};

const logoSources: Record<LogoVariant, string> = {
  default: "niar-logo.png",
  inverse: "niar-logo-footer.png",
};

/** Centraliza a marca NIAR para que Header e Footer compartilhem a mesma API. */
export function Logo({
  variant = "default",
  alt = "NIAR",
  ...props
}: LogoProps) {
  return (
    <img
      {...props}
      src={logoSources[variant]}
      alt={alt}
      style={{
        display: "block",
        height: variant === "inverse" ? niar.spacing.xl : niar.spacing["2xl"],
        width: "auto",
        ...(variant === "inverse" && {
          filter: "grayscale(1) brightness(0) invert(1)",
        }),
      }}
    />
  );
}
