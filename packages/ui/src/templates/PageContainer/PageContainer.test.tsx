import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NiarProvider } from "../../theme/NiarProvider";
import { PageContainer } from "./PageContainer";

describe("PageContainer", () => {
  it("renderiza o conteúdo em main", () => {
    render(<NiarProvider><PageContainer><p>Conteúdo</p></PageContainer></NiarProvider>);
    expect(screen.getByRole("main").textContent).toContain("Conteúdo");
  });
});
