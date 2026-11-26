import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Project } from "../../types/project.types";
import type { UserListItem } from "../../types/user.types";
import { ProjectAssignmentDialog } from "./ProjectAssignmentDialog";

vi.mock("@niar/ui", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Dialog: ({ open, title, children, actions }: any) => open ? (
    <div role="dialog" aria-label={String(title)}>
      <h2>{title}</h2>
      {children}
      <div>{actions}</div>
    </div>
  ) : null,
  ListText: ({ items }: any) => (
    <dl>{items.map((item: any) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
  ),
  StatusChip: ({ label }: any) => <span>{label}</span>,
  Checkbox: ({ label, checked, onChange, disabled }: any) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      {label}
    </label>
  ),
  Autocomplete: ({ label, options, value, onChange, onInputChange, disabled }: any) => (
    <label>
      {label}
      <input
        aria-label={`Buscar ${label}`}
        onChange={(event) => onInputChange?.(event, event.target.value, "input")}
        disabled={disabled}
      />
      <select
        aria-label={label}
        value={value?.value ?? ""}
        disabled={disabled}
        onChange={(event) => {
          const option = options.find((item: any) => item.value === event.target.value) ?? null;
          onChange?.(event, option);
        }}
      >
        <option value="">Selecione</option>
        {options.map((option: any) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  ),
}));

const project: Project = {
  id: 42,
  projectVersionId: 84,
  title: "Projeto de pesquisa",
  updatedAt: "2026-10-02T12:00:00.000Z",
  researcher: { id: 7, fullName: "Maria Pesquisadora", email: "maria@niar.local" },
  status: [{
    code: "submitted_to_committee",
    label: "Enviado ao comitê",
    versionNumber: 2,
    createdAt: "2026-10-02T12:00:00.000Z",
    notes: null,
  }],
  documents: [],
  evaluationStatus: "waiting",
};

const committeeMember: UserListItem = {
  id: 12,
  fullName: "Joana Comitê",
  email: "joana@niar.local",
  role: "committee",
  accountStatus: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  profile: null,
  researcherProfile: null,
  committeeProfile: null,
  coep: null,
  latestAuthEvaluation: null,
};

const renderDialog = (
  props: Partial<React.ComponentProps<typeof ProjectAssignmentDialog>> = {},
) => render(
  <ProjectAssignmentDialog
    open
    project={project}
    mode="select-member"
    members={[committeeMember]}
    membersLoading={false}
    loading={false}
    onSearchMembers={vi.fn()}
    onClose={vi.fn()}
    onSubmit={vi.fn()}
    {...props}
  />,
);

describe("ProjectAssignmentDialog", () => {
  it("renderiza o resumo e exige membro no modo gestor", async () => {
    const onSubmit = vi.fn();
    renderDialog({ onSubmit });

    expect(screen.getByText("Projeto de pesquisa")).toBeInTheDocument();
    expect(screen.getByText("Aguardando atribuição")).toBeInTheDocument();
    expect(screen.getByText("02/10/2026")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Selecione um membro do Comitê.");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("preserva a seleção, pesquisa e envia o ID do membro", async () => {
    const onSubmit = vi.fn();
    const onSearchMembers = vi.fn();
    const user = userEvent.setup();
    renderDialog({ onSubmit, onSearchMembers });

    await user.type(screen.getByLabelText("Buscar Selecione membro do comitê"), "Joana");
    expect(onSearchMembers).toHaveBeenLastCalledWith("Joana");
    const memberSelect = screen.getByRole("combobox", { name: /^Selecione membro do comitê$/ });
    expect(screen.getByRole("option", { name: "Joana Comitê" })).toBeInTheDocument();
    await user.selectOptions(memberSelect, "12");
    expect(memberSelect).toHaveValue("12");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).toHaveBeenCalledWith(12);
  });

  it("envia objeto de autoatribuição sem usuário no modo Comitê", async () => {
    const onSubmit = vi.fn();
    renderDialog({ mode: "self", members: [], onSubmit });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Confirme que deseja atribuir este projeto para você.",
    );
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("checkbox", { name: "Atribuir este projeto para mim" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).toHaveBeenCalledWith(undefined);
    expect(screen.queryByLabelText("Selecione membro do comitê")).not.toBeInTheDocument();
  });

  it("impede confirmação e cancelamento durante loading", () => {
    renderDialog({ loading: true });

    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("limpa a seleção ao trocar de projeto", async () => {
    const { rerender } = renderDialog();
    const memberSelect = screen.getByRole("combobox", { name: /^Selecione membro do comitê$/ });
    await userEvent.setup().selectOptions(memberSelect, "12");
    expect(memberSelect).toHaveValue("12");

    rerender(
      <ProjectAssignmentDialog
        open
        project={{ ...project, id: 43, projectVersionId: 85 }}
        mode="select-member"
        members={[committeeMember]}
        membersLoading={false}
        loading={false}
        onSearchMembers={vi.fn()}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: /^Selecione membro do comitê$/ })).toHaveValue("");
  });
});
