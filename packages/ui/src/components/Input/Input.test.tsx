import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Input } from "./Input";
import { Select } from "../Select/Select";

afterEach(cleanup);

it("alterna a senha preservando valor e foco sem submeter", () => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <Input label="Senha" type="password" defaultValue="segredo" />
    </form>,
  );
  const input = screen.getByLabelText("Senha");
  input.focus();
  expect(input).toHaveAttribute("type", "password");
  fireEvent.mouseDown(screen.getByRole("button", { name: "Mostrar senha" }));
  fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
  expect(input).toHaveAttribute("type", "text");
  expect(input).toHaveValue("segredo");
  expect(input).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
  expect(input).toHaveAttribute("type", "password");
  expect(submit).not.toHaveBeenCalled();
});

it("desabilita o controle de visibilidade", () => {
  render(<Input label="Senha" type="password" disabled />);
  expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeDisabled();
});

it("associa a mensagem de erro ao email", () => {
  render(
    <Input label="E-mail" type="email" error helperText="E-mail inválido" />,
  );
  expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
  expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription(
    "E-mail inválido",
  );
  expect(screen.getByLabelText("E-mail")).toBeInvalid();
});

it("seleciona uma opção e informa a alteração", () => {
  const change = vi.fn();
  render(
    <Select
      label="Base"
      defaultValue="own"
      onChange={change}
      options={[
        { value: "own", label: "Própria" },
        { value: "niar", label: "NIAR" },
      ]}
    />,
  );
  fireEvent.change(screen.getByRole("combobox", { name: "Base" }), {
    target: { value: "niar" },
  });
  expect(screen.getByRole("combobox")).toHaveValue("niar");
  expect(change).toHaveBeenCalledOnce();
});
