import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("renderiza itens e permite fechar", () => {
    const onClose = vi.fn();
    render(<Sidebar items={[{ label: "Início" }]} onClose={onClose} />);
    expect(screen.getByText("Início")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fechar menu" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
