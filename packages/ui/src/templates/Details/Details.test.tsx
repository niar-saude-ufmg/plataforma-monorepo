import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Details } from "./Details";

describe("Details", () => {
  it("renders title and detail items when open", () => {
    render(
      <Details
        open
        title="Detalhes"
        items={[{ label: "Status", value: "Em análise" }]}
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getByText("Em análise")).toBeTruthy();
  });

  it("calls onClose from the close button", async () => {
    const onClose = vi.fn();
    render(<Details open items={[]} onClose={onClose} />);

    screen.getByRole("button", { name: "Fechar" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the timeline variation", () => {
    render(
      <Details
        open
        variant="timeline"
        items={[{ title: "Projeto criado" }]}
      />,
    );

    expect(screen.getByText("Projeto criado")).toBeTruthy();
  });
});
