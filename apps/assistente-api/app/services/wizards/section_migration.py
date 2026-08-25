from __future__ import annotations

"""Migrate legacy section keys and wizard steps."""

from typing import Any, Optional

LEGACY_STEP_MAP = {
    "basics": "start",
    "intake": "project",
    "review": "project",
    "quality": "review",
    "export": "data_engineering",
    "cleaning": "data_engineering",
}


def migrate_current_step(step: str, section_data: Optional[dict[str, Any]] = None) -> str:
    if section_data and section_data.get("_wizard_flow_version", 0) >= 2:
        return step
    return LEGACY_STEP_MAP.get(step, step)


def migrate_section_data(section_data: dict) -> dict:
    if not section_data:
        return section_data
    migrated = dict(section_data)
    flow = str(migrated.get("analysis_application", "") or "").strip()
    methods = str(migrated.get("methods_analysis", "") or "").strip()
    if flow:
        if methods:
            migrated["methods_analysis"] = f"{methods}\n\n{flow}".strip()
        else:
            migrated["methods_analysis"] = flow
    migrated.pop("analysis_application", None)
    migrated.pop("data_governance_ethics", None)
    migrated.pop("timeline", None)
    if migrated.get("_wizard_flow_version", 0) < 2:
        migrated["_wizard_flow_version"] = 2
    return migrated
