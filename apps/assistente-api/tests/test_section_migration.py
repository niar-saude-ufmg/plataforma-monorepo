from app.services.wizards.section_migration import migrate_current_step, migrate_section_data


def test_migrate_current_step_legacy():
    assert migrate_current_step("basics") == "start"
    assert migrate_current_step("intake") == "project"
    assert migrate_current_step("review") == "project"
    assert migrate_current_step("quality") == "review"
    assert migrate_current_step("export") == "data_engineering"
    assert migrate_current_step("cleaning") == "data_engineering"
    assert migrate_current_step("project") == "project"


def test_migrate_current_step_skips_when_flow_v2():
    data = {"_wizard_flow_version": 2}
    assert migrate_current_step("review", data) == "review"
    assert migrate_current_step("quality", data) == "quality"


def test_migrate_section_data_merges_analysis_application():
    data = {
        "methods_analysis": "Plano ML",
        "analysis_application": "Fluxo com filtros e saídas",
        "data_governance_ethics": "Ética ignorada",
        "timeline": "Marco Q1",
    }
    migrated = migrate_section_data(data)
    assert "analysis_application" not in migrated
    assert "data_governance_ethics" not in migrated
    assert "timeline" not in migrated
    assert "Plano ML" in migrated["methods_analysis"]
    assert "Fluxo com filtros" in migrated["methods_analysis"]


def test_migrate_section_data_empty():
    assert migrate_section_data({}) == {}
    assert migrate_section_data({"background": "x"})["background"] == "x"
