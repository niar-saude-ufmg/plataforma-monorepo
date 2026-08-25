import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from app.models import WizardType
from app.services.scriptgen.validator import validate_script
from app.services.wizards.text_import import count_filled_sections
from scripts.bootstrap_onco_scenario import (
    EMPTY_SECTIONS,
    PROJECT_TITLE,
    build_initial_script,
    build_quality_checklist,
    build_section_data,
    load_structured_sections,
)


def test_load_structured_sections_from_repo():
    sections = load_structured_sections()
    assert count_filled_sections(sections) >= 8


def test_build_section_data_leaves_two_sections_empty():
    data = build_section_data()
    for key in EMPTY_SECTIONS:
        assert not str(data.get(key, "") or "").strip()
    filled = sum(1 for k in data if not k.startswith("_") and str(data.get(k, "") or "").strip())
    assert filled >= 9


def test_build_initial_script_valid_without_create_table():
    script = build_initial_script()
    result = validate_script(script)
    assert result["syntax_ok"] is True
    assert result["safety_ok"] is True
    assert result["valid"] is True
    assert "CREATE TABLE" not in script.upper()
    assert "patients" in script
    assert "cancer_diagnoses" in script


def test_build_quality_checklist_marks_empty_artifacts():
    data = build_section_data()
    checklist = build_quality_checklist(data)
    artifacts = next(item for item in checklist["items"] if item["id"] == "artifacts_listed")
    assert artifacts["passed"] is False


def test_bootstrap_preloaded_creates_project_and_cleaning():
    from scripts.bootstrap_onco_scenario import bootstrap_preloaded

    user = MagicMock()
    user.id = 7

    db = AsyncMock()
    db.add = MagicMock()
    db.flush = AsyncMock()
    db.commit = AsyncMock()

    onco_dataset = MagicMock()
    onco_dataset.id = 2

    with patch(
        "scripts.bootstrap_onco_scenario._get_onco_dataset",
        new_callable=AsyncMock,
        return_value=onco_dataset,
    ):
        project, cleaning = asyncio.run(bootstrap_preloaded(db, user))

    assert project.title == PROJECT_TITLE
    assert project.wizard_type == WizardType.project_doc
    assert project.current_step == "data_engineering"
    assert cleaning is not None
    assert cleaning.linked_project_id == project.id
    assert cleaning.dataset_id == 2
    assert cleaning.current_step == "script_draft"
    assert "CREATE TABLE" not in cleaning.script_content.upper()
    validation = __import__("json").loads(cleaning.validation_result)
    assert validation["valid"] is True


def test_bootstrap_preloaded_skip_cleaning():
    from scripts.bootstrap_onco_scenario import bootstrap_preloaded

    user = MagicMock()
    user.id = 7
    db = AsyncMock()
    db.add = MagicMock()
    db.flush = AsyncMock()
    db.commit = AsyncMock()

    project, cleaning = asyncio.run(bootstrap_preloaded(db, user, skip_cleaning=True))
    assert project.current_step == "review"
    assert cleaning is None
