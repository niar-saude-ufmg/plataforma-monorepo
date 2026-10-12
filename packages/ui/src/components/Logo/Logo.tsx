import type { ImgHTMLAttributes } from "react";
import { niar } from "../../tokens";

export type LogoVariant = "default" | "inverse";

export type LogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "style"> & {
  variant?: LogoVariant;
};

const logoSources: Record<LogoVariant, string> = {
  // Resolve os assets pelo bundle para que o logo não dependa da raiz da shell.
  // Isso é importante quando o componente é consumido como microfrontend.
  default: new URL("../../../public/niar-logo.png", import.meta.url).href,
  inverse: new URL("../../../public/niar-logo-footer.png", import.meta.url).href,
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
