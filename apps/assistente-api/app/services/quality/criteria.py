from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Optional


@dataclass
class QualityCriterion:
    id: str
    step: str
    label: str
    section_keys: list[str] = field(default_factory=list)
    validate: Optional[Callable[[dict], tuple[bool, str]]] = None


def _section_nonempty(section_data: dict, keys: list[str]) -> tuple[bool, str]:
    for key in keys:
        if str(section_data.get(key, "") or "").strip():
            return True, ""
    return False, f"Seções vazias: {', '.join(keys)}"


def _validate_objectives(section_data: dict) -> tuple[bool, str]:
    keys = ["research_questions", "objectives"]
    return _section_nonempty(section_data, keys)


def _validate_data(section_data: dict) -> tuple[bool, str]:
    keys = ["data_sources", "study_population", "variables_endpoints"]
    return _section_nonempty(section_data, keys)


def _validate_methods(section_data: dict) -> tuple[bool, str]:
    return _section_nonempty(section_data, ["methods_analysis"])


def _validate_responsible_ai(section_data: dict) -> tuple[bool, str]:
    return _section_nonempty(section_data, ["responsible_ai"])


def _validate_artifacts(section_data: dict) -> tuple[bool, str]:
    return _section_nonempty(section_data, ["expected_artifacts"])


def _validate_risks(section_data: dict) -> tuple[bool, str]:
    return _section_nonempty(section_data, ["risks_limitations"])


PROJECT_CRITERIA: list[QualityCriterion] = [
    QualityCriterion(
        id="objectives_clear",
        step="project",
        label="Objetivos e perguntas de pesquisa estão claros",
        section_keys=["research_questions", "objectives"],
        validate=_validate_objectives,
    ),
    QualityCriterion(
        id="data_sources",
        step="project",
        label="Fontes de dados e acesso estão descritos",
        section_keys=["data_sources"],
        validate=lambda sd: _section_nonempty(sd, ["data_sources"]),
    ),
    QualityCriterion(
        id="population_variables",
        step="project",
        label="População do estudo e variáveis/desfechos principais estão definidos",
        section_keys=["study_population", "variables_endpoints"],
        validate=_validate_data,
    ),
    QualityCriterion(
        id="methods_viable",
        step="project",
        label="Métodos, plano e fluxo de análise estão especificados e são viáveis",
        section_keys=["methods_analysis"],
        validate=_validate_methods,
    ),
    QualityCriterion(
        id="responsible_ai",
        step="project",
        label="Riscos de viés, equidade e explicabilidade estão discutidos",
        section_keys=["responsible_ai"],
        validate=_validate_responsible_ai,
    ),
    QualityCriterion(
        id="artifacts_listed",
        step="project",
        label="Artefatos esperados estão listados (tabelas, gráficos, modelos, exportações)",
        section_keys=["expected_artifacts"],
        validate=_validate_artifacts,
    ),
    QualityCriterion(
        id="risks_acknowledged",
        step="project",
        label="Riscos e limitações estão reconhecidos",
        section_keys=["risks_limitations"],
        validate=_validate_risks,
    ),
]


def criteria_for_step(step: str) -> list[QualityCriterion]:
    return [c for c in PROJECT_CRITERIA if c.step == step]


def all_criteria_labels() -> list[str]:
    return [c.label for c in PROJECT_CRITERIA]
