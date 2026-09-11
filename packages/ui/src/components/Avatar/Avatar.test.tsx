import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renderiza iniciais com texto alternativo", () => {
    render(<Avatar alt="Usuário NIAR">UN</Avatar>);
    expect(screen.getByText("UN")).toBeInTheDocument();
  });
});
