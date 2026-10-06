import StyleDictionary from "style-dictionary";

const referencePattern = /\{([^}]+)\}/g;

const toKebabCase = (value) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const toCssVariable = (value) =>
  value.replace(
    referencePattern,
    (_, path) => `var(--niar-${path.split(".").map(toKebabCase).join("-")})`,
  );

const toTokenAccess = (path) =>
  path
    .split(".")
    .map((part) => (part.match(/^[A-Za-z_$][\w$]*$/) ? `.${part}` : `[${JSON.stringify(part)}]`))
    .join("");

const getTypographyTokens = (dictionary) =>
  Object.entries(dictionary.tokens.typography ?? {}).map(([name, token]) => ({
    name,
    value: token.original?.value ?? token.value,
  }));

StyleDictionary.registerFormat({
  name: "niar/typography-mixins",
  format: ({ dictionary }) =>
    getTypographyTokens(dictionary)
      .map(({ name, value }) => {
        const declarations = Object.entries(value)
          .map(
            ([property, propertyValue]) =>
              `\t${toKebabCase(property)}: ${toCssVariable(propertyValue)};`,
          )
          .join("\n");

        return `@mixin typography-${name} {\n${declarations}\n}`;
      })
      .join("\n\n") + "\n",
});

StyleDictionary.registerFormat({
  name: "niar/typography-functions",
  format: ({ dictionary }) => {
    const entries = getTypographyTokens(dictionary)
      .map(({ name, value }) => {
        const properties = Object.entries(value)
          .map(([property, propertyValue]) => {
            const path = propertyValue.match(/\{([^}]+)\}/)?.[1];
            const expression = path ? `tokens${toTokenAccess(path)}` : JSON.stringify(propertyValue);
            return `    ${property}: ${expression},`;
          })
          .join("\n");

        return `  ${JSON.stringify(name)}: {\n${properties}\n  },`;
      })
      .join("\n");

    return `import tokens from "./tokens";

export const typographyStyles = {
${entries}
} as const;

export type TypographyVariant = keyof typeof typographyStyles;
export type TypographyStyle = (typeof typographyStyles)[TypographyVariant];

export function typographyStyle(variant: TypographyVariant): TypographyStyle {
  return typographyStyles[variant];
}
`;
  },
});

const dictionary = new StyleDictionary({
  source: ["src/tokens/global.json", "src/tokens/brand.json", "src/tokens/typography.json"],
  platforms: {
    scss: {
      buildPath: "src/tokens/styles/",
      files: [
        {
          destination: "typography.scss",
          format: "niar/typography-mixins",
          filter: (token) => token.path[0] === "typography",
        },
      ],
    },
    typescript: {
      buildPath: "src/tokens/styles/",
      files: [
        {
          destination: "typography.ts",
          format: "niar/typography-functions",
          filter: (token) => token.path[0] === "typography",
        },
      ],
    },
  },
});

await dictionary.buildAllPlatforms();
