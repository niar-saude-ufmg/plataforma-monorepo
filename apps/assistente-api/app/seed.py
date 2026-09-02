import asyncio
import json
import os

from sqlalchemy import select, text, update

from app.core.config import get_exports_dir, get_settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models import (
    AppSetting,
    CatalogColumn,
    CatalogTable,
    Dataset,
    User,
    UserRole,
    WizardSession,
)

PATIENT_SAMPLES = [
    {"patient_id": 1001, "birth_year": 1965, "sex": "F"},
    {"patient_id": 1002, "birth_year": 1978, "sex": "M"},
    {"patient_id": 1003, "birth_year": 1982, "sex": "F"},
    {"patient_id": 1004, "birth_year": 1954, "sex": "M"},
    {"patient_id": 1005, "birth_year": 1990, "sex": "F"},
    {"patient_id": 1006, "birth_year": 1968, "sex": "M"},
    {"patient_id": 1007, "birth_year": 1975, "sex": "F"},
    {"patient_id": 1008, "birth_year": 1988, "sex": "Outro"},
    {"patient_id": 1009, "birth_year": 1960, "sex": "M"},
    {"patient_id": 1010, "birth_year": 1995, "sex": "F"},
]

ENCOUNTER_SAMPLES = [
    {"encounter_id": 5001, "patient_id": 1001, "encounter_date": "2023-01-15", "diagnosis_code": "E11.9"},
    {"encounter_id": 5002, "patient_id": 1001, "encounter_date": "2023-06-20", "diagnosis_code": "I10"},
    {"encounter_id": 5003, "patient_id": 1002, "encounter_date": "2023-02-10", "diagnosis_code": "E11.65"},
    {"encounter_id": 5004, "patient_id": 1003, "encounter_date": "2023-03-05", "diagnosis_code": "J45.909"},
    {"encounter_id": 5005, "patient_id": 1004, "encounter_date": "2023-04-12", "diagnosis_code": "E11.9"},
    {"encounter_id": 5006, "patient_id": 1005, "encounter_date": "2023-05-18", "diagnosis_code": None},
    {"encounter_id": 5007, "patient_id": 1006, "encounter_date": "2023-07-01", "diagnosis_code": "I25.10"},
    {"encounter_id": 5008, "patient_id": 1007, "encounter_date": "2023-08-22", "diagnosis_code": "E11.9"},
    {"encounter_id": 5009, "patient_id": 1008, "encounter_date": "2023-09-30", "diagnosis_code": "M54.5"},
    {"encounter_id": 5010, "patient_id": 1009, "encounter_date": "2023-10-15", "diagnosis_code": "E11.9"},
]

ONCO_DATASET_NAME = "Oncologia BH (SUS)"
ONCO_DATASET_LEGACY_NAMES = ("Oncologia BH (SUS + Suplementar)",)

ONCO_PATIENT_SAMPLES = [
    {"patient_id": 2001, "birth_year": 1962, "sex": "F", "health_system": "SUS", "municipality": "Belo Horizonte"},
    {"patient_id": 2002, "birth_year": 1955, "sex": "M", "health_system": "SUS", "municipality": "Belo Horizonte"},
    {"patient_id": 2003, "birth_year": 1970, "sex": "F", "health_system": "SUS", "municipality": "Contagem"},
    {"patient_id": 2004, "birth_year": 1948, "sex": "M", "health_system": "SUS", "municipality": "Belo Horizonte"},
    {"patient_id": 2005, "birth_year": 1968, "sex": "F", "health_system": "SUS", "municipality": "Betim"},
    {"patient_id": 2006, "birth_year": 1975, "sex": "M", "health_system": "SUS", "municipality": "Belo Horizonte"},
    {"patient_id": 2007, "birth_year": 1980, "sex": "F", "health_system": "SUS", "municipality": "Nova Lima"},
    {"patient_id": 2008, "birth_year": 1959, "sex": "M", "health_system": "SUS", "municipality": "Belo Horizonte"},
]

ONCO_DIAGNOSIS_SAMPLES = [
    {"diagnosis_id": 3001, "patient_id": 2001, "cancer_site": "mama", "diagnosis_date": "2015-03-12", "stage": "II"},
    {"diagnosis_id": 3002, "patient_id": 2002, "cancer_site": "próstata", "diagnosis_date": "2012-08-05", "stage": "III"},
    {"diagnosis_id": 3003, "patient_id": 2003, "cancer_site": "cólon", "diagnosis_date": "2018-01-20", "stage": "I"},
    {"diagnosis_id": 3004, "patient_id": 2004, "cancer_site": "pulmão", "diagnosis_date": "2010-11-03", "stage": "IV"},
    {"diagnosis_id": 3005, "patient_id": 2005, "cancer_site": "mama", "diagnosis_date": "2019-06-15", "stage": "II"},
    {"diagnosis_id": 3006, "patient_id": 2006, "cancer_site": "próstata", "diagnosis_date": "2016-04-22", "stage": "II"},
    {"diagnosis_id": 3007, "patient_id": 2007, "cancer_site": "cólon", "diagnosis_date": "2020-09-10", "stage": "III"},
    {"diagnosis_id": 3008, "patient_id": 2008, "cancer_site": "pulmão", "diagnosis_date": "2014-02-28", "stage": "III"},
]

ONCO_TREATMENT_SAMPLES = [
    {"treatment_id": 4001, "patient_id": 2001, "treatment_type": "quimioterapia", "start_date": "2015-04-01", "end_date": "2015-10-15"},
    {"treatment_id": 4002, "patient_id": 2002, "treatment_type": "radioterapia", "start_date": "2012-09-01", "end_date": "2012-12-20"},
    {"treatment_id": 4003, "patient_id": 2003, "treatment_type": "cirurgia", "start_date": "2018-02-10", "end_date": "2018-02-10"},
    {"treatment_id": 4004, "patient_id": 2004, "treatment_type": "quimioterapia", "start_date": "2010-11-20", "end_date": "2011-05-30"},
    {"treatment_id": 4005, "patient_id": 2005, "treatment_type": "hormonioterapia", "start_date": "2019-07-01", "end_date": "2021-07-01"},
    {"treatment_id": 4006, "patient_id": 2006, "treatment_type": "cirurgia", "start_date": "2016-05-15", "end_date": "2016-05-15"},
    {"treatment_id": 4007, "patient_id": 2007, "treatment_type": "quimioterapia", "start_date": "2020-10-01", "end_date": "2021-04-01"},
    {"treatment_id": 4008, "patient_id": 2008, "treatment_type": "radioterapia", "start_date": "2014-03-15", "end_date": "2014-06-30"},
]

ONCO_HOSPITALIZATION_SAMPLES = [
    {"hospitalization_id": 5001, "patient_id": 2001, "admit_date": "2015-04-05", "discharge_date": "2015-04-12", "cost_brl": 12450.00},
    {"hospitalization_id": 5002, "patient_id": 2002, "admit_date": "2012-08-10", "discharge_date": "2012-08-18", "cost_brl": 28700.00},
    {"hospitalization_id": 5003, "patient_id": 2003, "admit_date": "2018-02-08", "discharge_date": "2018-02-15", "cost_brl": 18900.00},
    {"hospitalization_id": 5004, "patient_id": 2004, "admit_date": "2010-11-15", "discharge_date": "2010-11-28", "cost_brl": 45200.00},
    {"hospitalization_id": 5005, "patient_id": 2005, "admit_date": "2019-06-20", "discharge_date": "2019-06-25", "cost_brl": 9800.00},
    {"hospitalization_id": 5006, "patient_id": 2006, "admit_date": "2016-05-10", "discharge_date": "2016-05-18", "cost_brl": 15600.00},
    {"hospitalization_id": 5007, "patient_id": 2007, "admit_date": "2020-09-15", "discharge_date": "2020-09-22", "cost_brl": 22100.00},
    {"hospitalization_id": 5008, "patient_id": 2008, "admit_date": "2014-03-01", "discharge_date": "2014-03-10", "cost_brl": 19800.00},
]

ONCO_OUTCOME_SAMPLES = [
    {"outcome_id": 6001, "patient_id": 2001, "event_type": "sobrevida", "event_date": "2022-12-31", "survival_days": 2816},
    {"outcome_id": 6002, "patient_id": 2002, "event_type": "óbito", "event_date": "2018-05-20", "survival_days": 2114},
    {"outcome_id": 6003, "patient_id": 2003, "event_type": "sobrevida", "event_date": "2022-12-31", "survival_days": 1776},
    {"outcome_id": 6004, "patient_id": 2004, "event_type": "óbito", "event_date": "2012-03-10", "survival_days": 493},
    {"outcome_id": 6005, "patient_id": 2005, "event_type": "sobrevida", "event_date": "2022-12-31", "survival_days": 1295},
    {"outcome_id": 6006, "patient_id": 2006, "event_type": "sobrevida", "event_date": "2022-12-31", "survival_days": 2415},
    {"outcome_id": 6007, "patient_id": 2007, "event_type": "recidiva", "event_date": "2021-08-15", "survival_days": 339},
    {"outcome_id": 6008, "patient_id": 2008, "event_type": "óbito", "event_date": "2016-11-02", "survival_days": 978},
]


async def _onco_dataset(db):
    result = await db.execute(select(Dataset).where(Dataset.name == ONCO_DATASET_NAME))
    dataset = result.scalar_one_or_none()
    if dataset:
        return dataset
    for legacy_name in ONCO_DATASET_LEGACY_NAMES:
        result = await db.execute(select(Dataset).where(Dataset.name == legacy_name))
        dataset = result.scalar_one_or_none()
        if dataset:
            return dataset
    return None


async def _migrate_onco_dataset(db) -> None:
    dataset = await _onco_dataset(db)
    if not dataset:
        return
    dataset.name = ONCO_DATASET_NAME
    dataset.description = (
        "Coorte sintética de demonstração: pacientes oncológicos atendidos pelo SUS-BH "
        "em Belo Horizonte (2008–2022). Cânceres sólidos: mama, próstata, cólon e pulmão."
    )
    dataset.enabled = True

    # Desativa cópias legadas duplicadas (mesmo catálogo, nome antigo)
    for legacy_name in ONCO_DATASET_LEGACY_NAMES:
        result = await db.execute(
            select(Dataset).where(
                Dataset.name == legacy_name,
                Dataset.id != dataset.id,
            )
        )
        for legacy in result.scalars():
            await db.execute(
                update(WizardSession)
                .where(WizardSession.dataset_id == legacy.id)
                .values(dataset_id=dataset.id)
            )
            legacy.enabled = False
    samples_by_table = {
        "patients": ONCO_PATIENT_SAMPLES,
        "cancer_diagnoses": ONCO_DIAGNOSIS_SAMPLES,
        "oncology_treatments": ONCO_TREATMENT_SAMPLES,
        "hospitalizations": ONCO_HOSPITALIZATION_SAMPLES,
        "outcomes": ONCO_OUTCOME_SAMPLES,
    }
    for table_name, samples in samples_by_table.items():
        table_result = await db.execute(
            select(CatalogTable).where(
                CatalogTable.dataset_id == dataset.id,
                CatalogTable.name == table_name,
            )
        )
        table = table_result.scalar_one_or_none()
        if table:
            table.sample_rows = json.dumps(samples)
            if table_name == "patients":
                table.description = "Pacientes da coorte oncológica SUS-BH (demografia)"
    patients_table = await db.execute(
        select(CatalogTable).where(
            CatalogTable.dataset_id == dataset.id,
            CatalogTable.name == "patients",
        )
    )
    patients = patients_table.scalar_one_or_none()
    if patients:
        col_result = await db.execute(
            select(CatalogColumn).where(
                CatalogColumn.table_id == patients.id,
                CatalogColumn.name == "health_system",
            )
        )
        health_col = col_result.scalar_one_or_none()
        if health_col:
            health_col.description = "Sistema de saúde (SUS-BH)"


async def _seed_onco_dataset(db) -> None:
    if await _onco_dataset(db):
        return

    dataset = Dataset(
        name=ONCO_DATASET_NAME,
        description=(
            "Coorte sintética de demonstração: pacientes oncológicos atendidos pelo SUS-BH "
            "em Belo Horizonte (2008–2022). Cânceres sólidos: mama, próstata, cólon e pulmão."
        ),
        enabled=True,
    )
    db.add(dataset)
    await db.flush()

    tables_spec = [
        (
            "patients",
            "Pacientes da coorte oncológica SUS-BH (demografia)",
            ONCO_PATIENT_SAMPLES,
            [
                ("patient_id", "INTEGER", False, True, False, "Identificador único do paciente"),
                ("birth_year", "INTEGER", True, False, False, "Ano de nascimento"),
                ("sex", "VARCHAR(10)", True, False, False, "Sexo biológico (M, F)"),
                ("health_system", "VARCHAR(20)", True, False, False, "Sistema de saúde (SUS-BH)"),
                ("municipality", "VARCHAR(100)", True, False, False, "Município de residência"),
            ],
        ),
        (
            "cancer_diagnoses",
            "Diagnósticos de câncer sólido por paciente",
            ONCO_DIAGNOSIS_SAMPLES,
            [
                ("diagnosis_id", "INTEGER", False, True, False, "Identificador único do diagnóstico"),
                ("patient_id", "INTEGER", False, False, True, "Chave estrangeira para patients.patient_id"),
                ("cancer_site", "VARCHAR(50)", True, False, False, "Site do câncer (mama, próstata, cólon, pulmão)"),
                ("diagnosis_date", "DATE", False, False, False, "Data do diagnóstico"),
                ("stage", "VARCHAR(10)", True, False, False, "Estadiamento clínico (I–IV)"),
            ],
        ),
        (
            "oncology_treatments",
            "Tratamentos antineoplásicos por paciente",
            ONCO_TREATMENT_SAMPLES,
            [
                ("treatment_id", "INTEGER", False, True, False, "Identificador único do tratamento"),
                ("patient_id", "INTEGER", False, False, True, "Chave estrangeira para patients.patient_id"),
                ("treatment_type", "VARCHAR(50)", True, False, False, "Tipo de tratamento"),
                ("start_date", "DATE", False, False, False, "Início do tratamento"),
                ("end_date", "DATE", True, False, False, "Fim do tratamento"),
            ],
        ),
        (
            "hospitalizations",
            "Internações hospitalares relacionadas ao cuidado oncológico",
            ONCO_HOSPITALIZATION_SAMPLES,
            [
                ("hospitalization_id", "INTEGER", False, True, False, "Identificador único da internação"),
                ("patient_id", "INTEGER", False, False, True, "Chave estrangeira para patients.patient_id"),
                ("admit_date", "DATE", False, False, False, "Data de admissão"),
                ("discharge_date", "DATE", True, False, False, "Data de alta"),
                ("cost_brl", "DECIMAL(12,2)", True, False, False, "Custo total da internação (BRL)"),
            ],
        ),
        (
            "outcomes",
            "Desfechos clínicos e tempo de sobrevida",
            ONCO_OUTCOME_SAMPLES,
            [
                ("outcome_id", "INTEGER", False, True, False, "Identificador único do desfecho"),
                ("patient_id", "INTEGER", False, False, True, "Chave estrangeira para patients.patient_id"),
                ("event_type", "VARCHAR(30)", True, False, False, "Tipo de evento (sobrevida, óbito, recidiva)"),
                ("event_date", "DATE", True, False, False, "Data do evento"),
                ("survival_days", "INTEGER", True, False, False, "Dias de sobrevida desde o diagnóstico"),
            ],
        ),
    ]

    table_objects: dict[str, CatalogTable] = {}
    for name, description, samples, _columns in tables_spec:
        table = CatalogTable(
            dataset_id=dataset.id,
            name=name,
            description=description,
            sample_rows=json.dumps(samples),
        )
        db.add(table)
        table_objects[name] = table
    await db.flush()

    columns_to_add: list[CatalogColumn] = []
    for _name, _description, _samples, columns in tables_spec:
        table = table_objects[_name]
        for col_name, data_type, nullable, is_pk, is_fk, description in columns:
            columns_to_add.append(
                CatalogColumn(
                    table_id=table.id,
                    name=col_name,
                    data_type=data_type,
                    nullable=nullable,
                    is_primary_key=is_pk,
                    is_foreign_key=is_fk,
                    description=description,
                )
            )
    db.add_all(columns_to_add)


async def _ensure_max_active_datasets(db, target: int) -> None:
    result = await db.execute(select(AppSetting).where(AppSetting.key == "max_active_datasets"))
    setting = result.scalar_one_or_none()
    if setting:
        if int(setting.value or "1") < target:
            setting.value = str(target)
    else:
        db.add(AppSetting(key="max_active_datasets", value=str(target)))


async def _ensure_sample_rows_column() -> None:
    async with engine.begin() as conn:
        await conn.execute(
            text("ALTER TABLE catalog_tables ADD COLUMN IF NOT EXISTS sample_rows TEXT DEFAULT '[]'")
        )


async def _ensure_chat_message_channel_column() -> None:
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS channel VARCHAR(20) DEFAULT 'intake'"
            )
        )


async def _ensure_chat_message_section_key_column() -> None:
    async with engine.begin() as conn:
        await conn.execute(
            text("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS section_key VARCHAR(50)")
        )
        await conn.execute(
            text(
                "UPDATE chat_messages SET section_key = 'background' "
                "WHERE channel = 'intake' AND section_key IS NULL"
            )
        )


async def _demo_dataset(db):
    for name in ("Conjunto de Saúde de Exemplo", "Sample Health Dataset"):
        result = await db.execute(select(Dataset).where(Dataset.name == name))
        dataset = result.scalar_one_or_none()
        if dataset:
            return dataset
    return None


async def _migrate_demo_dataset_labels(db) -> None:
    dataset = await _demo_dataset(db)
    if not dataset:
        return
    dataset.name = "Conjunto de Saúde de Exemplo"
    dataset.description = "Conjunto de dados de demonstração para desenvolvimento e testes"

    for table_name, description in [
        ("patients", "Registros demográficos e de inclusão de pacientes"),
        ("encounters", "Registros de encontros clínicos"),
    ]:
        table_result = await db.execute(
            select(CatalogTable).where(
                CatalogTable.dataset_id == dataset.id,
                CatalogTable.name == table_name,
            )
        )
        table = table_result.scalar_one_or_none()
        if table:
            table.description = description


async def _apply_demo_samples(db) -> None:
    dataset = await _demo_dataset(db)
    if not dataset:
        return
    for table_name, samples in [("patients", PATIENT_SAMPLES), ("encounters", ENCOUNTER_SAMPLES)]:
        result = await db.execute(
            select(CatalogTable).where(
                CatalogTable.dataset_id == dataset.id,
                CatalogTable.name == table_name,
            )
        )
        table = result.scalar_one_or_none()
        if table and (not table.sample_rows or table.sample_rows == "[]"):
            table.sample_rows = json.dumps(samples)


async def seed() -> None:
    settings = get_settings()
    get_exports_dir()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await _ensure_sample_rows_column()
    await _ensure_chat_message_channel_column()
    await _ensure_chat_message_section_key_column()

    async with AsyncSessionLocal() as db:
        admin = await db.execute(select(User).where(User.email == "admin@hra.local"))
        if not admin.scalar_one_or_none():
            db.add(
                User(
                    email="admin@hra.local",
                    full_name="Administrador do Sistema",
                    hashed_password=get_password_hash("admin12345"),
                    role=UserRole.admin,
                )
            )
            db.add(
                User(
                    email="researcher@hra.local",
                    full_name="Pesquisador Demo",
                    hashed_password=get_password_hash("research12345"),
                    role=UserRole.researcher,
                )
            )

        defaults = {
            "max_active_datasets": str(settings.max_active_datasets),
            "institution_name": settings.institution_name,
            "llm_model": settings.llm_model,
            "session_retention_days": str(settings.session_retention_days),
        }
        for key, value in defaults.items():
            existing = await db.execute(select(AppSetting).where(AppSetting.key == key))
            if not existing.scalar_one_or_none():
                db.add(AppSetting(key=key, value=value))

        dataset_result = await db.execute(select(Dataset).where(Dataset.name == "Conjunto de Saúde de Exemplo"))
        if not dataset_result.scalar_one_or_none():
            dataset = Dataset(
                name="Conjunto de Saúde de Exemplo",
                description="Conjunto de dados de demonstração para desenvolvimento e testes",
                enabled=True,
            )
            db.add(dataset)
            await db.flush()

            patients = CatalogTable(
                dataset_id=dataset.id,
                name="patients",
                description="Registros demográficos e de inclusão de pacientes",
                sample_rows=json.dumps(PATIENT_SAMPLES),
            )
            encounters = CatalogTable(
                dataset_id=dataset.id,
                name="encounters",
                description="Registros de encontros clínicos",
                sample_rows=json.dumps(ENCOUNTER_SAMPLES),
            )
            db.add_all([patients, encounters])
            await db.flush()

            db.add_all(
                [
                    CatalogColumn(
                        table_id=patients.id,
                        name="patient_id",
                        data_type="INTEGER",
                        nullable=False,
                        is_primary_key=True,
                        description="Identificador único do paciente",
                    ),
                    CatalogColumn(
                        table_id=patients.id,
                        name="birth_year",
                        data_type="INTEGER",
                        nullable=True,
                        description="Ano de nascimento",
                    ),
                    CatalogColumn(
                        table_id=patients.id,
                        name="sex",
                        data_type="VARCHAR(10)",
                        nullable=True,
                        valid_values="M, F, Outro, Desconhecido",
                        description="Sexo biológico ao nascer",
                    ),
                    CatalogColumn(
                        table_id=encounters.id,
                        name="encounter_id",
                        data_type="INTEGER",
                        nullable=False,
                        is_primary_key=True,
                        description="Identificador único do encontro",
                    ),
                    CatalogColumn(
                        table_id=encounters.id,
                        name="patient_id",
                        data_type="INTEGER",
                        nullable=False,
                        is_foreign_key=True,
                        description="Chave estrangeira para patients.patient_id",
                    ),
                    CatalogColumn(
                        table_id=encounters.id,
                        name="encounter_date",
                        data_type="DATE",
                        nullable=False,
                        description="Data do encontro clínico",
                    ),
                    CatalogColumn(
                        table_id=encounters.id,
                        name="diagnosis_code",
                        data_type="VARCHAR(20)",
                        nullable=True,
                        description="Código principal de diagnóstico CID 10",
                    ),
                ]
            )
        else:
            await _apply_demo_samples(db)

        await _migrate_demo_dataset_labels(db)

        await _seed_onco_dataset(db)
        await _migrate_onco_dataset(db)
        await _ensure_max_active_datasets(db, settings.max_active_datasets)

        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())
