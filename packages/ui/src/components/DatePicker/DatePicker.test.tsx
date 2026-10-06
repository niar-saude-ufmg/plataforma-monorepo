import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  afterEach(cleanup);

  it("renderiza como campo de data com label retraído", () => {
    render(<DatePicker label="Data de aprovação" />);

    const input = screen.getByLabelText("Data de aprovação");
    expect(input).toHaveAttribute("type", "date");
    expect(document.querySelector(`label[for="${input.id}"]`)).toHaveAttribute("data-shrink", "true");
  });

  it("abre o seletor ao clicar na área do campo", () => {
    const showPicker = vi.fn();
    const { container } = render(<DatePicker label="Data de aprovação" />);

    const input = screen.getByLabelText("Data de aprovação");
    Object.defineProperty(input, "showPicker", { configurable: true, value: showPicker });

    fireEvent.mouseDown(input);
    fireEvent.click(container.firstElementChild as HTMLElement);

    expect(showPicker).toHaveBeenCalledTimes(2);
    expect(input).toHaveFocus();
  });

  it("aplica o cursor de interação e respeita o estado desabilitado", () => {
    const { container } = render(<DatePicker label="Data de aprovação" disabled />);

    expect(container.firstElementChild).toHaveClass("niar-date-picker", "niar-date-picker--disabled");
    expect(screen.getByLabelText("Data de aprovação")).toBeDisabled();
  });
});
