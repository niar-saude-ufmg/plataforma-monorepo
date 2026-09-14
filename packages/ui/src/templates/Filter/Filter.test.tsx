import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Filter } from "./Filter";

describe("Filter", () => {
  it("renders each configured filter field", () => {
    render(
      <Filter
        search={[{ key: "status", label: "Status", options: ["Aprovado"] }]}
      />,
    );

    expect(screen.getByLabelText("Status")).toBeTruthy();
  });
});
