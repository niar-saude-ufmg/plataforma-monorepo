import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileUpload } from "./FileUpload";
describe("FileUpload", () => {
  afterEach(() => cleanup());

  it("seleciona e retorna arquivos", () => {
    const onChange = vi.fn();
    render(<FileUpload onChange={onChange} />);
    const input = screen.getByLabelText("Selecionar arquivo");
    const file = new File(["conteúdo"], "projeto.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it("permite remover um arquivo selecionado", () => {
    const onChange = vi.fn();
    render(<FileUpload onChange={onChange} />);
    const input = screen.getByLabelText("Selecionar arquivo");
    const file = new File(["conteúdo"], "projeto.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(
      screen.getByRole("button", { name: "Remover projeto.pdf" }),
    );

    expect(screen.queryByText("projeto.pdf")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("aceita arquivos arrastados para a área de upload", () => {
    const onChange = vi.fn();
    render(<FileUpload onChange={onChange} />);
    const dropzone = screen.getByRole("region", {
      name: "Área para enviar arquivos",
    });
    const file = new File(["conteúdo"], "arrastado.pdf", {
      type: "application/pdf",
    });

    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith([file]);
    expect(screen.getByText("arrastado.pdf")).toBeInTheDocument();
  });
});
