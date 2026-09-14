import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination } from "./Pagination";
describe("Pagination", () => { it("renderiza a navegação de páginas", () => { render(<Pagination count={3} />); expect(screen.getByRole("navigation", { name: "pagination navigation" })).toBeInTheDocument(); expect(screen.getByRole("button", { name: "Go to page 2" })).toBeInTheDocument(); }); });
