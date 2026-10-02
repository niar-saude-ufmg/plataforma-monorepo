import { describe, expect, it } from "vitest";
import { typographyStyle, typographyStyles } from "./index";

describe("tokens de tipografia", () => {
  it("expõe estilos semânticos para uso em componentes", () => {
    expect(typographyStyle("label")).toEqual(typographyStyles.label);
    expect(typographyStyles.label).toMatchObject({
      fontFamily: expect.any(String),
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0px",
    });
  });
});
