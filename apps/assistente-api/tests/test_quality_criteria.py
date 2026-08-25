from app.services.llm.prompts import PROJECT_DOC_SECTIONS
from app.services.quality.criteria import PROJECT_CRITERIA, criteria_for_step


def test_project_doc_sections_count():
    assert len(PROJECT_DOC_SECTIONS) == 11
    assert "timeline" not in PROJECT_DOC_SECTIONS


def test_quality_criteria_registry():
    assert len(PROJECT_CRITERIA) == 7
    project_criteria = criteria_for_step("project")
    assert len(project_criteria) == 7
    assert all(c.step == "project" for c in project_criteria)
    assert all(c.id for c in PROJECT_CRITERIA)


def test_validate_objectives_fails_when_empty():
    criterion = next(c for c in PROJECT_CRITERIA if c.id == "objectives_clear")
    passed, note = criterion.validate({})
    assert passed is False
    assert note


def test_validate_objectives_passes_with_content():
    criterion = next(c for c in PROJECT_CRITERIA if c.id == "objectives_clear")
    passed, _ = criterion.validate({"objectives": "Estimar risco"})
    assert passed is True
