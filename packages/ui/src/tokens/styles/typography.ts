import tokens from "./tokens";

export const typographyStyles = {
  "heading": {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.heading,
    fontWeight: tokens.fontWeight.bold,
    lineHeight: tokens.lineHeight.tight,
    letterSpacing: tokens.letterSpacing.none,
  },
  "title": {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.title,
    fontWeight: tokens.fontWeight.semibold,
    lineHeight: tokens.lineHeight.tight,
    letterSpacing: tokens.letterSpacing.none,
  },
  "subtitle": {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.subtitle,
    fontWeight: tokens.fontWeight.medium,
    lineHeight: tokens.lineHeight.normal,
    letterSpacing: tokens.letterSpacing.none,
  },
  "body": {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.body,
    fontWeight: tokens.fontWeight.regular,
    lineHeight: tokens.lineHeight.normal,
    letterSpacing: tokens.letterSpacing.none,
  },
  "caption": {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.caption,
    fontWeight: tokens.fontWeight.regular,
    lineHeight: tokens.lineHeight.relaxed,
    letterSpacing: tokens.letterSpacing.none,
  },
  "label": {
    fontFamily: tokens.fontFamily,
    fontSize: tokens.fontSize.body,
    fontWeight: tokens.fontWeight.medium,
    lineHeight: tokens.lineHeight.normal,
    letterSpacing: tokens.letterSpacing.none,
  },
} as const;

export type TypographyVariant = keyof typeof typographyStyles;
export type TypographyStyle = (typeof typographyStyles)[TypographyVariant];

export function typographyStyle(variant: TypographyVariant): TypographyStyle {
  return typographyStyles[variant];
}
