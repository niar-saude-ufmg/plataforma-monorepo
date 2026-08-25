from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8)
    role: str = "researcher"

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if "@" not in email or email.startswith("@") or email.endswith("@"):
            raise ValueError("Informe um e-mail válido")
        local, _, domain = email.partition("@")
        if not local or not domain or " " in email:
            raise ValueError("Informe um e-mail válido")
        return email

    @field_validator("full_name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("Informe o nome completo")
        return name


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}

    @field_validator("role", mode="before")
    @classmethod
    def coerce_role(cls, value: object) -> str:
        return getattr(value, "value", value)  # type: ignore[return-value]


class LoginRequest(BaseModel):
    email: str
    password: str


class AppSettingOut(BaseModel):
    key: str
    value: str

    model_config = {"from_attributes": True}


class AppSettingUpdate(BaseModel):
    value: str


class DatasetCreate(BaseModel):
    name: str
    description: str = ""
    enabled: bool = True


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None


class DatasetOut(BaseModel):
    id: int
    name: str
    description: str
    enabled: bool

    model_config = {"from_attributes": True}


class CatalogColumnCreate(BaseModel):
    name: str
    data_type: str
    nullable: bool = True
    is_primary_key: bool = False
    is_foreign_key: bool = False
    description: str = ""
    valid_values: str = ""
    coding_notes: str = ""
    is_phi: bool = False
    notes: str = ""


class CatalogColumnOut(CatalogColumnCreate):
    id: int
    table_id: int

    model_config = {"from_attributes": True}


class CatalogTableCreate(BaseModel):
    name: str
    description: str = ""


class CatalogTableOut(BaseModel):
    id: int
    dataset_id: int
    name: str
    description: str
    columns: list[CatalogColumnOut] = []

    model_config = {"from_attributes": True}


class TableRelationshipCreate(BaseModel):
    from_table_id: int
    to_table_id: int
    from_column: str
    to_column: str
    relationship_type: str = "many_to_one"
    description: str = ""


class TableRelationshipOut(TableRelationshipCreate):
    id: int

    model_config = {"from_attributes": True}


class WizardSessionCreate(BaseModel):
    wizard_type: str
    title: str = "Sem título"


class WizardSessionUpdate(BaseModel):
    title: Optional[str] = None
    current_step: Optional[str] = None
    dataset_id: Optional[int] = None
    linked_project_id: Optional[int] = None
    section_data: Optional[dict[str, Any]] = None
    script_content: Optional[str] = None


class ChatMessageCreate(BaseModel):
    content: str


class ImportTextRequest(BaseModel):
    full_text: str = Field(min_length=20)


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    channel: str = "intake"
    section_key: Optional[str] = None
    created_at: str

    model_config = {"from_attributes": True}


class CleaningVersionCreate(BaseModel):
    label: str = ""
    notes: str = ""


class CleaningVersionNew(BaseModel):
    save_current: bool = True
    current_label: str = ""
    notes: str = ""


class CleaningVersionOut(BaseModel):
    id: int
    session_id: int
    version_number: int
    label: str
    script_content: str
    validation_result: dict
    messages_snapshot: list[dict]
    notes: str
    created_at: str

    model_config = {"from_attributes": True}


class WizardSessionOut(BaseModel):
    id: int
    wizard_type: str
    current_step: str
    title: str
    dataset_id: Optional[int]
    linked_project_id: Optional[int]
    section_data: dict[str, Any]
    script_content: str
    validation_result: dict[str, Any]
    quality_checklist: dict[str, Any]
    llm_model_used: str
    created_at: str
    updated_at: str
    messages: list[ChatMessageOut] = []
    linked_cleaning_step: Optional[str] = None


class QualityCheckItem(BaseModel):
    item: str
    passed: bool
    note: str = ""


class ValidationResult(BaseModel):
    valid: bool
    syntax_ok: bool
    lint_ok: bool
    safety_ok: bool
    issues: list[str] = []


class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource_type: str
    resource_id: str
    details: str
    created_at: str

    model_config = {"from_attributes": True}
