import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs } from "./Tabs";
describe("Tabs", () => {
  it("renderiza as opções", () => {
    render(
      <Tabs
        value="one"
        options={[
          { value: "one", label: "Uma" },
          { value: "two", label: "Duas" },
        ]}
      />,
    );
    expect(screen.getByRole("tab", { name: "Uma" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Duas" })).toBeVisible();
  });
});
