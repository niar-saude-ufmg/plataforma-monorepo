#!/usr/bin/env python3
"""Bootstrap a full oncology demo scenario for manual UI testing.

Default mode pre-populates wizard sessions without calling the LLM.
Use --live-llm to exercise import, chat/extract, and script generation via the API layer.

Run from backend/:
  set -a && source ../.env && set +a
  PYTHONPATH=. python scripts/bootstrap_onco_scenario.py
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.models import ChatMessage, Dataset, User, WizardSession, WizardType
from app.seed import ONCO_DATASET_LEGACY_NAMES, ONCO_DATASET_NAME
from app.services.llm.prompts import PROJECT_DOC_SECTIONS
from app.services.quality.criteria import PROJECT_CRITERIA
from app.services.scriptgen.validator import validate_script
from app.services.wizards.orchestrator import (
    extract_section_content,
    generate_initial_clean_script,
    run_doc_intake,
    split_full_text_into_sections,
)
from app.services.wizards.section_migration import migrate_section_data
from app.services.wizards.text_import import split_by_headings

PROJECT_TITLE = "Trajetória Oncológica BH (demo)"
REPO_ROOT = Path(__file__).resolve().parents[2]
STRUCTURED_MD_PATH = REPO_ROOT / "docs" / "demo" / "projeto_oncologico_estruturado.md"
DEMO_USER_EMAIL = "researcher@hra.local"
FRONTEND_BASE_URL = os.environ.get("FRONTEND_BASE_URL", "http://localhost:5173")

EMPTY_SECTIONS = ("expected_artifacts", "references")

CHAT_THREADS: dict[str, list[tuple[str, str]]] = {
    "data_sources": [
        (
            "user",
            "Preciso confirmar se a coorte inclui apenas pacientes com diagnóstico em BH "
            "ou também quem foi referenciado de outros municípios.",
        ),
        (
            "assistant",
            "Pelo plano, a inclusão é por município de atendimento em Belo Horizonte, "
            "independente do município de residência. Pacientes referenciados de Contagem, "
            "Betim e região metropolitana entram se o atendimento ocorreu em BH. "
            "As fontes do SUS-BH (APAC/SIA, SIH, SIM) serão vinculadas "
            "pelo identificador anonimizado do paciente.",
        ),
    ],
    "study_population": [
        (
            "user",
            "A amostra de 50 mil pacientes inclui todos os cânceres sólidos ou só os quatro mais prevalentes?",
        ),
        (
            "assistant",
            "A coorte principal restringe-se aos cânceres sólidos mais prevalentes em BH: "
            "mama, próstata, cólon/reto e pulmão. Pacientes com outros sítios podem ser "
            "excluídos na fase de preparação analítica. O desenho é observacional retrospectivo, "
            "sem intervenção clínica.",
        ),
    ],
    "methods_analysis": [
        (
            "user",
            "Como garantir a qualidade e padronização dos dados entre APAC/SIA, SIH e SIM?",
        ),
        (
            "assistant",
            "As três fases CRISP-DM incluem padronização conceitual entre os sistemas de informação do SUS-BH "
            "antes das análises. Serão avaliadas completude, consistência temporal e compatibilidade de "
            "codificação entre APAC/SIA, SIH e SIM. Análises preditivas serão secundárias e sempre "
            "acompanhadas de explicabilidade (SHAP ou equivalente quando aplicável).",
        ),
    ],
}


def load_structured_markdown(path: Path | None = None) -> str:
    md_path = path or STRUCTURED_MD_PATH
    if not md_path.is_file():
        raise FileNotFoundError(f"Documento estruturado não encontrado: {md_path}")
    return md_path.read_text(encoding="utf-8")


def load_structured_sections(path: Path | None = None) -> dict[str, str]:
    return split_by_headings(load_structured_markdown(path))


def build_section_data(sections: dict[str, str] | None = None) -> dict:
    base = dict(sections or load_structured_sections())
    for key in EMPTY_SECTIONS:
        base[key] = ""
    data = migrate_section_data(
        {
            **base,
            "_current_section": "expected_artifacts",
            "_imported": True,
            "_wizard_flow_version": 2,
            "_bootstrap": "onco_scenario",
        }
    )
    return data


def build_quality_checklist(section_data: dict) -> dict:
    items = []
    for criterion in PROJECT_CRITERIA:
        passed = True
        note = ""
        if criterion.validate:
            passed, note = criterion.validate(section_data)
        if criterion.id == "artifacts_listed" and not section_data.get("expected_artifacts", "").strip():
            passed = False
            note = "Seção de artefatos ainda não preenchida — complete via chat na UI."
        items.append(
            {
                "id": criterion.id,
                "item": criterion.label,
                "passed": passed,
                "note": note,
                "step": criterion.step,
            }
        )
    return {"items": items}


def build_initial_script() -> str:
    return '''"""Pipeline de preparação analítica — coorte oncológica BH (demo).

Lê tabelas do conjunto Oncologia BH (SUS), filtra coorte 2008–2022
e produz base analítica em nível de paciente. Dados sintéticos de demonstração.
"""
import os

import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://hra:hra_secret@localhost:5432/hra")


def load_tables(engine) -> dict[str, pd.DataFrame]:
    """Carrega tabelas fonte do catálogo oncológico."""
    tables = {}
    for name in (
        "patients",
        "cancer_diagnoses",
        "oncology_treatments",
        "hospitalizations",
        "outcomes",
    ):
        tables[name] = pd.read_sql(f"SELECT * FROM {name}", engine)
    return tables


def build_cohort(tables: dict[str, pd.DataFrame]) -> pd.DataFrame:
    """Coorte: diagnóstico 2008–2022, cânceres sólidos prevalentes, atendimento BH."""
    patients = tables["patients"].copy()
    diagnoses = tables["cancer_diagnoses"].copy()

    diagnoses["diagnosis_date"] = pd.to_datetime(diagnoses["diagnosis_date"])
    cohort_start = pd.Timestamp("2008-01-01")
    cohort_end = pd.Timestamp("2022-12-31")

    solid_sites = {"mama", "próstata", "cólon", "pulmão", "colon", "pulmao", "prostata"}
    # TODO: confirmar lista final de sítios com equipe clínica
    dx_filtered = diagnoses[
        (diagnoses["diagnosis_date"] >= cohort_start)
        & (diagnoses["diagnosis_date"] <= cohort_end)
        & (diagnoses["cancer_site"].str.lower().isin({s.lower() for s in solid_sites}))
    ]

    cohort = patients.merge(
        dx_filtered,
        on="patient_id",
        how="inner",
        suffixes=("", "_dx"),
    )
    return cohort


def aggregate_utilization(tables: dict[str, pd.DataFrame], cohort: pd.DataFrame) -> pd.DataFrame:
    """Agrega internações e tratamentos por paciente."""
    patient_ids = cohort["patient_id"].unique()
    hospitalizations = tables["hospitalizations"]
    hospitalizations = hospitalizations[hospitalizations["patient_id"].isin(patient_ids)]
    hosp_agg = (
        hospitalizations.groupby("patient_id")
        .agg(total_hosp_cost_brl=("cost_brl", "sum"), hosp_count=("hospitalization_id", "count"))
        .reset_index()
    )

    treatments = tables["oncology_treatments"]
    treatments = treatments[treatments["patient_id"].isin(patient_ids)]
    treat_agg = (
        treatments.groupby("patient_id")
        .agg(treatment_count=("treatment_id", "count"))
        .reset_index()
    )

    outcomes = tables["outcomes"]
    outcomes = outcomes[outcomes["patient_id"].isin(patient_ids)]

    result = cohort.merge(hosp_agg, on="patient_id", how="left")
    result = result.merge(treat_agg, on="patient_id", how="left")
    result = result.merge(
        outcomes[["patient_id", "event_type", "survival_days"]],
        on="patient_id",
        how="left",
    )
    return result


def main() -> pd.DataFrame:
    engine = create_engine(DATABASE_URL)
    tables = load_tables(engine)
    cohort = build_cohort(tables)
    analytic = aggregate_utilization(tables, cohort)
    # TODO: exportar para parquet ou CSV em ambiente aprovado
    print(f"Coorte analítica: {len(analytic)} pacientes")
    return analytic


if __name__ == "__main__":
    main()
'''


async def _get_demo_user(db) -> User:
    result = await db.execute(select(User).where(User.email == DEMO_USER_EMAIL))
    user = result.scalar_one_or_none()
    if not user:
        raise RuntimeError(
            f"Usuário demo {DEMO_USER_EMAIL} não encontrado. Execute: PYTHONPATH=. python -m app.seed"
        )
    return user


async def _get_onco_dataset(db) -> Dataset:
    for name in (ONCO_DATASET_NAME, *ONCO_DATASET_LEGACY_NAMES):
        result = await db.execute(select(Dataset).where(Dataset.name == name))
        dataset = result.scalar_one_or_none()
        if dataset:
            return dataset
    raise RuntimeError(
        f"Dataset {ONCO_DATASET_NAME!r} não encontrado. Execute: PYTHONPATH=. python -m app.seed"
    )


async def reset_demo_sessions(db, user_id: int) -> int:
    result = await db.execute(
        select(WizardSession.id).where(
            WizardSession.user_id == user_id,
            WizardSession.title == PROJECT_TITLE,
        )
    )
    session_ids = [row[0] for row in result.all()]
    if not session_ids:
        return 0

    await db.execute(delete(ChatMessage).where(ChatMessage.session_id.in_(session_ids)))
    await db.execute(delete(WizardSession).where(WizardSession.id.in_(session_ids)))
    await db.commit()
    return len(session_ids)


async def _add_chat_threads(db, session_id: int, section_keys: list[str] | None = None) -> None:
    keys = section_keys or list(CHAT_THREADS.keys())
    for section_key in keys:
        for role, content in CHAT_THREADS.get(section_key, []):
            db.add(
                ChatMessage(
                    session_id=session_id,
                    role=role,
                    content=content,
                    channel="intake",
                    section_key=section_key,
                )
            )


async def bootstrap_preloaded(
    db,
    user: User,
    *,
    skip_cleaning: bool = False,
) -> tuple[WizardSession, WizardSession | None]:
    sections = load_structured_sections()
    section_data = build_section_data(sections)
    checklist = build_quality_checklist(section_data)
    script = build_initial_script()
    validation = validate_script(script)

    onco_dataset = await _get_onco_dataset(db)

    project = WizardSession(
        user_id=user.id,
        wizard_type=WizardType.project_doc,
        title=PROJECT_TITLE,
        current_step="data_engineering" if not skip_cleaning else "review",
        section_data=json.dumps(section_data, ensure_ascii=False),
        quality_checklist=json.dumps(checklist, ensure_ascii=False),
    )
    db.add(project)
    await db.flush()

    await _add_chat_threads(db, project.id)

    cleaning: WizardSession | None = None
    if not skip_cleaning:
        cleaning = WizardSession(
            user_id=user.id,
            wizard_type=WizardType.data_clean,
            linked_project_id=project.id,
            title=f"Engenharia de Dados: {PROJECT_TITLE}",
            dataset_id=onco_dataset.id,
            current_step="script_draft",
            script_content=script,
            validation_result=json.dumps(validation),
        )
        db.add(cleaning)
        await db.flush()

        db.add(
            ChatMessage(
                session_id=cleaning.id,
                role="assistant",
                content=(
                    "Rascunho inicial gerado com base no plano oncológico e no esquema "
                    f"{ONCO_DATASET_NAME}. Revise joins, filtros de coorte 2008–2022 "
                    "e confirme regras de negócio marcadas como TODO."
                ),
                channel="discussion",
            )
        )

    project.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return project, cleaning


async def bootstrap_live_llm(
    db,
    user: User,
    *,
    skip_cleaning: bool = False,
) -> tuple[WizardSession, WizardSession | None]:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("--live-llm requer GEMINI_API_KEY no .env")

    os.environ.setdefault("GEMINI_API_KEY", settings.gemini_api_key)
    os.environ.setdefault("GOOGLE_API_KEY", settings.gemini_api_key)

    full_text = load_structured_markdown()
    project = WizardSession(
        user_id=user.id,
        wizard_type=WizardType.project_doc,
        title=PROJECT_TITLE,
        current_step="start",
        section_data=json.dumps(
            {"_current_section": PROJECT_DOC_SECTIONS[0], "_wizard_flow_version": 2},
            ensure_ascii=False,
        ),
    )
    db.add(project)
    await db.flush()

    sections, model, _debug = await split_full_text_into_sections(full_text)
    section_data = migrate_section_data(json.loads(project.section_data or "{}"))
    section_data.update(sections)
    section_data["_imported"] = True
    project.section_data = json.dumps(section_data, ensure_ascii=False)
    project.current_step = "project"
    project.llm_model_used = model

    for section_key in ("expected_artifacts", "references"):
        section_data["_current_section"] = section_key
        project.section_data = json.dumps(section_data, ensure_ascii=False)
        user_msg = f"Preciso detalhar a seção {section_key} para o projeto oncológico BH."
        db.add(
            ChatMessage(
                session_id=project.id,
                role="user",
                content=user_msg,
                channel="intake",
                section_key=section_key,
            )
        )
        await db.flush()
        result = await db.execute(
            select(WizardSession)
            .where(WizardSession.id == project.id)
            .options(selectinload(WizardSession.messages))
        )
        project = result.scalar_one()
        reply = await run_doc_intake(db, project, user_msg)
        db.add(
            ChatMessage(
                session_id=project.id,
                role="assistant",
                content=reply,
                channel="intake",
                section_key=section_key,
            )
        )
        await db.flush()
        result = await db.execute(
            select(WizardSession)
            .where(WizardSession.id == project.id)
            .options(selectinload(WizardSession.messages))
        )
        project = result.scalar_one()
        extracted = await extract_section_content(db, project, section_key)
        content = extracted.get("content", extracted) if isinstance(extracted, dict) else extracted
        section_data[section_key] = content
        project.section_data = json.dumps(section_data, ensure_ascii=False)

    await _add_chat_threads(db, project.id)
    project.quality_checklist = json.dumps(build_quality_checklist(section_data), ensure_ascii=False)
    project.current_step = "data_engineering" if not skip_cleaning else "review"

    cleaning: WizardSession | None = None
    if not skip_cleaning:
        onco_dataset = await _get_onco_dataset(db)
        cleaning = WizardSession(
            user_id=user.id,
            wizard_type=WizardType.data_clean,
            linked_project_id=project.id,
            title=f"Engenharia de Dados: {PROJECT_TITLE}",
            dataset_id=onco_dataset.id,
            current_step="schema_explore",
        )
        db.add(cleaning)
        await db.flush()
        script = await generate_initial_clean_script(db, cleaning)
        cleaning.script_content = script
        cleaning.current_step = "script_draft"
        cleaning.validation_result = json.dumps(validate_script(script))

    await db.commit()
    return project, cleaning


def print_summary(project: WizardSession, cleaning: WizardSession | None) -> None:
    section_data = json.loads(project.section_data or "{}")
    filled = sum(
        1 for key in PROJECT_DOC_SECTIONS if str(section_data.get(key, "") or "").strip()
    )
    empty = [key for key in PROJECT_DOC_SECTIONS if not str(section_data.get(key, "") or "").strip()]

    print("\n=== Cenário oncológico bootstrap ===")
    print(f"Projeto: {PROJECT_TITLE}")
    print(f"URL: {FRONTEND_BASE_URL}/projects/{project.id}")
    print(f"Seções preenchidas: {filled}/{len(PROJECT_DOC_SECTIONS)}")
    if empty:
        print(f"Seções vazias (testar chat manual): {', '.join(empty)}")
    print(f"Step projeto: {project.current_step}")

    if cleaning:
        validation = json.loads(cleaning.validation_result or "{}")
        print(f"\nEngenharia de dados (sessão {cleaning.id}):")
        print(f"  Dataset: {ONCO_DATASET_NAME}")
        print(f"  Step: {cleaning.current_step}")
        print(f"  Script válido: {validation.get('valid', False)}")
        if validation.get("issues"):
            print(f"  Issues: {validation['issues']}")

    print("\n--- Roteiro rápido ---")
    print("1. Login researcher@hra.local / research12345")
    print("2. Abrir projeto → revisar seções importadas")
    if empty:
        print(f"3. Completar seção(ões) vazia(s) via chat + Extrair seção")
    print("4. Revisar Projeto → checklist → avançar engenharia")
    print("5. Engenharia → explorar esquema Oncologia BH → validar script → submeter bundle")


async def main_async(args: argparse.Namespace) -> int:
    get_settings.cache_clear()

    async with AsyncSessionLocal() as db:
        user = await _get_demo_user(db)

        if args.reset:
            removed = await reset_demo_sessions(db, user.id)
            if removed:
                print(f"Removidas {removed} sessão(ões) demo anteriores.")

        if args.live_llm:
            project, cleaning = await bootstrap_live_llm(db, user, skip_cleaning=args.skip_cleaning)
        else:
            project, cleaning = await bootstrap_preloaded(db, user, skip_cleaning=args.skip_cleaning)

        await db.refresh(project)
        if cleaning:
            await db.refresh(cleaning)

    print_summary(project, cleaning)
    return 0


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Bootstrap cenário demo oncológico BH")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Remove sessões demo anteriores com o mesmo título antes de criar",
    )
    parser.add_argument(
        "--live-llm",
        action="store_true",
        help="Usa LLM para import, chat/extract e geração de script (requer GEMINI_API_KEY)",
    )
    parser.add_argument(
        "--skip-cleaning",
        action="store_true",
        help="Cria apenas sessão de projeto (sem engenharia de dados)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        return asyncio.run(main_async(args))
    except (RuntimeError, FileNotFoundError) as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
