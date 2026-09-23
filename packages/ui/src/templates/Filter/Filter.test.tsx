import { fireEvent, render, screen } from "@testing-library/react";
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

  it("updates checkbox and radio visuals when values are not controlled", () => {
    render(
      <Filter
        checkedOptions={[
          {
            key: "visibility",
            label: "Visibilidade",
            type: "checkbox",
            options: [{ value: "active", label: "Ativos" }],
          },
          {
            key: "owner",
            label: "Responsável",
            type: "radio",
            options: [{ value: "me", label: "Meus projetos" }],
          },
        ]}
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Ativos" });
    const radio = screen.getByRole("radio", { name: "Meus projetos" });

    fireEvent.click(checkbox);
    fireEvent.click(radio);

    expect((checkbox as HTMLInputElement).checked).toBe(true);
    expect((radio as HTMLInputElement).checked).toBe(true);
  });
});
