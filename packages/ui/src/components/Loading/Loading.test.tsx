import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loading } from "./Loading";
import { Skeleton } from "../Skeleton/Skeleton";
describe("Loading", () => {
  it("expõe o progresso circular", () => {
    render(<Loading />);
    expect(screen.getByLabelText("Carregando")).toBeVisible();
  });
  it("renderiza as linhas do skeleton", () => {
    render(<Skeleton lines={3} />);
    const status = screen.getByRole("status", { name: "Carregando conteúdo" });
    expect(status.children).toHaveLength(3);
  });
});
