import { useEffect, useMemo, useState } from "react";
import { EVALUATION_STATUS_LABELS } from "@niar/contracts";
import {
  Autocomplete,
  Button,
  Checkbox,
  ListText,
  StatusChip,
  type AutocompleteOption,
} from "@niar/ui";
import type { ProjectListItem } from "../../types/project.types";
import type { UserListItem } from "../../types/user.types";
import { formatDate } from "../../utils/formatters/date";
import { FixedDialog } from "../FixedDialog";
import "./ProjectAssignmentDialog.scss";

export type ProjectAssignmentDialogProps = {
  open: boolean;
  project: ProjectListItem | null;
  mode: "select-member" | "self";
  members: UserListItem[];
  membersLoading: boolean;
  loading: boolean;
  onSearchMembers: (search: string) => void;
  onClose: () => void;
  onSubmit: (assignedToUserId?: number) => void;
};

export function ProjectAssignmentDialog({
  open,
  project,
  mode,
  members,
  membersLoading,
  loading,
  onSearchMembers,
  onClose,
  onSubmit,
}: ProjectAssignmentDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selfAssignmentConfirmed, setSelfAssignmentConfirmed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedMemberId(null);
    setSelfAssignmentConfirmed(false);
    setValidationError(null);
  }, [open, project?.id]);

  const memberOptions = useMemo<AutocompleteOption[]>(
    () => members.map((member) => ({
      value: String(member.id),
      label: member.fullName,
    })),
    [members],
  );
  const selectedMember = memberOptions.find(
    (option) => option.value === String(selectedMemberId),
  ) ?? null;

  if (!project) return null;

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleSubmit = () => {
    if (mode === "select-member" && selectedMemberId === null) {
      setValidationError("Selecione um membro do Comitê.");
      return;
    }
    if (mode === "self" && !selfAssignmentConfirmed) {
      setValidationError("Confirme que deseja atribuir este projeto para você.");
      return;
    }

    setValidationError(null);
    onSubmit(mode === "select-member" ? selectedMemberId ?? undefined : undefined);
  };

  const title = "Atribuir projeto";

  return (
    <FixedDialog
      open={open}
      title={title}
      ariaLabel={title}
      minWidth="560px"
      onClose={handleClose}
      actions={
        <>
          <Button type="button" variant="outlined" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <div className="project-assignment-dialog">
        <p className="project-assignment-dialog__description">
          Confira os dados do projeto e defina a pessoa responsável.
        </p>

        <div className="project-assignment-dialog__summary">
          <h4 className="project-assignment-dialog__section-title">Dados do projeto</h4>
          <ListText
            aria-label="Dados do projeto"
            dense
            items={[
              { label: "Projeto", value: project.title },
              {
                label: "Status",
                value: (
                  <StatusChip
                    label={EVALUATION_STATUS_LABELS[project.evaluationStatus ?? "waiting"]}
                    status="default"
                  />
                ),
              },
              { label: "Atualizado", value: formatDate(project.updatedAt, { fallback: "—" }) },
            ]}
          />
        </div>

        {mode === "select-member" ? (
          <div className="project-assignment-dialog__member-field">
            <h4 className="project-assignment-dialog__section-title">
              Responsável pelo projeto
            </h4>
            <Autocomplete
              label="Selecione membro do comitê"
              options={memberOptions}
              value={selectedMember}
              loading={membersLoading}
              disabled={loading}
              noOptionsText={membersLoading ? "Carregando membros..." : "Nenhum membro ativo encontrado"}
              onInputChange={(_event, value, reason) => {
                if (reason === "input") onSearchMembers(value);
              }}
              onChange={(_event, value) => {
                const option = value &&
                  typeof value === "object" &&
                  !Array.isArray(value) &&
                  "value" in value
                  ? value as AutocompleteOption
                  : null;
                setSelectedMemberId(option ? Number(option.value) : null);
                setValidationError(null);
              }}
            />
            {validationError ? (
              <span className="project-assignment-dialog__error" role="alert">
                {validationError}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="project-assignment-dialog__self-assignment">
            <h4 className="project-assignment-dialog__section-title">Atribuição</h4>
            <Checkbox
              label="Atribuir este projeto para mim"
              checked={selfAssignmentConfirmed}
              disabled={loading}
              onChange={(event) => {
                setSelfAssignmentConfirmed(event.target.checked);
                setValidationError(null);
              }}
            />
            {validationError ? (
              <span className="project-assignment-dialog__error" role="alert">
                {validationError}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </FixedDialog>
  );
}
