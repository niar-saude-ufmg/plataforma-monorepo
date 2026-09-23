import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline } from "./Timeline";

describe("Timeline", () => {
  it("renderiza itens na ordem e com semântica de lista", () => {
    render(
      <Timeline
        items={[
          { title: "Primeiro" },
          { title: "Segundo", description: "Detalhes" },
        ]}
      />,
    );
    expect(
      screen.getByRole("list", { name: "Linha do tempo" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(2);
    expect(screen.getByText("Detalhes")).toBeInTheDocument();
  });
});
