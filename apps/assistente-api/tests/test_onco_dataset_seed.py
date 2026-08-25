import asyncio
from unittest.mock import AsyncMock, MagicMock

from app.models import CatalogTable, Dataset
from app.seed import (
    ONCO_DATASET_NAME,
    ONCO_DIAGNOSIS_SAMPLES,
    ONCO_HOSPITALIZATION_SAMPLES,
    ONCO_OUTCOME_SAMPLES,
    ONCO_PATIENT_SAMPLES,
    ONCO_TREATMENT_SAMPLES,
    _onco_dataset,
    _seed_onco_dataset,
)


def test_onco_sample_tables_have_rows():
    assert len(ONCO_PATIENT_SAMPLES) >= 8
    assert len(ONCO_DIAGNOSIS_SAMPLES) >= 8
    assert len(ONCO_TREATMENT_SAMPLES) >= 8
    assert len(ONCO_HOSPITALIZATION_SAMPLES) >= 8
    assert len(ONCO_OUTCOME_SAMPLES) >= 8


def test_onco_patient_samples_are_all_sus():
    systems = {row["health_system"] for row in ONCO_PATIENT_SAMPLES}
    assert systems == {"SUS"}


def test_onco_diagnosis_samples_include_prevalent_sites():
    sites = {row["cancer_site"] for row in ONCO_DIAGNOSIS_SAMPLES}
    assert "mama" in sites
    assert "próstata" in sites


def test_seed_onco_dataset_creates_five_tables():
    db = AsyncMock()
    existing = MagicMock()
    existing.scalar_one_or_none.return_value = None
    db.execute = AsyncMock(return_value=existing)
    db.add = MagicMock()
    db.add_all = MagicMock()
    db.flush = AsyncMock()

    added: list = []

    def capture_add(obj):
        added.append(obj)
        if isinstance(obj, Dataset):
            obj.id = 99

    def capture_add_all(objs):
        added.extend(objs)

    db.add.side_effect = capture_add
    db.add_all.side_effect = capture_add_all

    asyncio.run(_seed_onco_dataset(db))

    datasets = [o for o in added if isinstance(o, Dataset)]
    tables = [o for o in added if isinstance(o, CatalogTable)]

    assert len(datasets) == 1
    assert datasets[0].name == ONCO_DATASET_NAME
    assert len(tables) == 5
    table_names = {t.name for t in tables}
    assert table_names == {
        "patients",
        "cancer_diagnoses",
        "oncology_treatments",
        "hospitalizations",
        "outcomes",
    }
    assert db.add_all.called
    column_batch = db.add_all.call_args[0][0]
    assert len(column_batch) == 25
    assert db.flush.await_count >= 2


def test_seed_onco_dataset_skips_when_exists():
    db = AsyncMock()
    existing_dataset = Dataset(name=ONCO_DATASET_NAME, id=1)
    result = MagicMock()
    result.scalar_one_or_none.return_value = existing_dataset
    db.execute = AsyncMock(return_value=result)

    asyncio.run(_seed_onco_dataset(db))
    db.add.assert_not_called()


def test_onco_dataset_lookup():
    db = AsyncMock()
    dataset = Dataset(name=ONCO_DATASET_NAME, id=42)
    result = MagicMock()
    result.scalar_one_or_none.return_value = dataset
    db.execute = AsyncMock(return_value=result)

    found = asyncio.run(_onco_dataset(db))
    assert found.id == 42
    db.execute.assert_called_once()
