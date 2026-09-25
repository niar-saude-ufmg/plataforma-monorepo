import enum
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class UserRole(str, enum.Enum):
    researcher = "researcher"
    admin = "admin"
    committee = "committee"


class WizardType(str, enum.Enum):
    project_doc = "project_doc"
    data_clean = "data_clean"


USER_ROLE_ENUM = Enum(
    UserRole,
    name="user_role",
    schema="shared",
    create_type=False,
)

WIZARD_TYPE_ENUM = Enum(
    WizardType,
    name="wizard_type",
    schema="assistant",
    create_type=False,
)


class WizardStep(str, enum.Enum):
    start = "start"
    project = "project"
    review = "review"
    data_engineering = "data_engineering"
    basics = "basics"
    intake = "intake"
    quality = "quality"
    export = "export"
    cleaning = "cleaning"
    select_dataset = "select_dataset"
    link_project = "link_project"
    schema_explore = "schema_explore"
    discussion = "discussion"
    script_draft = "script_draft"
    validation = "validation"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(USER_ROLE_ENUM, default=UserRole.researcher)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    wizard_sessions: Mapped[list["WizardSession"]] = relationship(back_populates="user")
    owned_projects: Mapped[list["Project"]] = relationship(back_populates="owner")
    status_changes: Mapped[list["ProjectStatusHistory"]] = relationship(back_populates="actor")


class AppSetting(Base):
    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str] = mapped_column(Text, default="")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    tables: Mapped[list["CatalogTable"]] = relationship(
        back_populates="dataset", cascade="all, delete-orphan"
    )


class CatalogTable(Base):
    __tablename__ = "catalog_tables"
    __table_args__ = (UniqueConstraint("dataset_id", "name", name="uq_table_dataset_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    sample_rows: Mapped[str] = mapped_column(Text, default="[]")

    dataset: Mapped["Dataset"] = relationship(back_populates="tables")
    columns: Mapped[list["CatalogColumn"]] = relationship(
        back_populates="table", cascade="all, delete-orphan"
    )
    relationships_from: Mapped[list["TableRelationship"]] = relationship(
        back_populates="from_table",
        foreign_keys="TableRelationship.from_table_id",
        cascade="all, delete-orphan",
    )


class CatalogColumn(Base):
    __tablename__ = "catalog_columns"
    __table_args__ = (UniqueConstraint("table_id", "name", name="uq_column_table_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    table_id: Mapped[int] = mapped_column(ForeignKey("catalog_tables.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    data_type: Mapped[str] = mapped_column(String(100))
    nullable: Mapped[bool] = mapped_column(Boolean, default=True)
    is_primary_key: Mapped[bool] = mapped_column(Boolean, default=False)
    is_foreign_key: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str] = mapped_column(Text, default="")
    valid_values: Mapped[str] = mapped_column(Text, default="")
    coding_notes: Mapped[str] = mapped_column(Text, default="")
    is_phi: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, default="")

    table: Mapped["CatalogTable"] = relationship(back_populates="columns")


class TableRelationship(Base):
    __tablename__ = "table_relationships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    from_table_id: Mapped[int] = mapped_column(ForeignKey("catalog_tables.id", ondelete="CASCADE"))
    to_table_id: Mapped[int] = mapped_column(ForeignKey("catalog_tables.id", ondelete="CASCADE"))
    from_column: Mapped[str] = mapped_column(String(255))
    to_column: Mapped[str] = mapped_column(String(255))
    relationship_type: Mapped[str] = mapped_column(String(50), default="many_to_one")
    description: Mapped[str] = mapped_column(Text, default="")

    from_table: Mapped["CatalogTable"] = relationship(
        back_populates="relationships_from", foreign_keys=[from_table_id]
    )


class WizardSession(Base):
    __tablename__ = "wizard_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    wizard_type: Mapped[WizardType] = mapped_column(WIZARD_TYPE_ENUM)
    current_step: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(255), default="Untitled")
    dataset_id: Mapped[Optional[int]] = mapped_column(ForeignKey("datasets.id"), nullable=True)
    linked_project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("wizard_sessions.id"), nullable=True
    )
    section_data: Mapped[str] = mapped_column(Text, default="{}")
    script_content: Mapped[str] = mapped_column(Text, default="")
    validation_result: Mapped[str] = mapped_column(Text, default="{}")
    quality_checklist: Mapped[str] = mapped_column(Text, default="{}")
    llm_model_used: Mapped[str] = mapped_column(String(100), default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(back_populates="wizard_sessions")
    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.id"
    )
    exports: Mapped[list["ExportArtifact"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )
    cleaning_versions: Mapped[list["CleaningVersion"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="CleaningVersion.version_number"
    )
    project_versions: Mapped[list["ProjectVersion"]] = relationship(
        back_populates="source_session"
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("wizard_sessions.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    channel: Mapped[str] = mapped_column(String(20), default="intake")
    section_key: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    session: Mapped["WizardSession"] = relationship(back_populates="messages")


class ExportArtifact(Base):
    __tablename__ = "export_artifacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("wizard_sessions.id", ondelete="CASCADE"))
    filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(500))
    artifact_type: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    session: Mapped["WizardSession"] = relationship(back_populates="exports")
    project_documents: Mapped[list["ProjectDocument"]] = relationship(
        back_populates="source_export_artifact"
    )


class CleaningVersion(Base):
    __tablename__ = "cleaning_versions"
    __table_args__ = (UniqueConstraint("session_id", "version_number", name="uq_cleaning_version"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("wizard_sessions.id", ondelete="CASCADE"))
    version_number: Mapped[int] = mapped_column(Integer)
    label: Mapped[str] = mapped_column(String(255), default="")
    script_content: Mapped[str] = mapped_column(Text, default="")
    validation_result: Mapped[str] = mapped_column(Text, default="{}")
    messages_snapshot: Mapped[str] = mapped_column(Text, default="[]")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    session: Mapped["WizardSession"] = relationship(back_populates="cleaning_versions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100))
    resource_type: Mapped[str] = mapped_column(String(100), default="")
    resource_id: Mapped[str] = mapped_column(String(100), default="")
    details: Mapped[str] = mapped_column(Text, default="")
    ip_address: Mapped[str] = mapped_column(String(50), default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class ProjectStatus(str, enum.Enum):
    submitted_to_committee = "submitted_to_committee"
    resubmitted_to_committee = "resubmitted_to_committee"
    under_review = "under_review"
    needs_changes = "needs_changes"
    approved = "approved"
    rejected = "rejected"


PROJECT_STATUS_ENUM = Enum(
    ProjectStatus,
    name="project_status",
    schema="shared",
    create_type=False,
)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    title: Mapped[str] = mapped_column(String(255))
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    owner: Mapped["User"] = relationship(back_populates="owned_projects")
    versions: Mapped[list["ProjectVersion"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class ProjectVersion(Base):
    __tablename__ = "project_versions"
    __table_args__ = (
        UniqueConstraint("project_id", "version_number", name="uq_admin_project_versions_project_number"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    source_wizard_session_id: Mapped[int] = mapped_column(
        ForeignKey("wizard_sessions.id", ondelete="RESTRICT")
    )
    version_number: Mapped[int] = mapped_column(Integer)
    characterization_snapshot: Mapped[dict] = mapped_column(JSONB, default=dict)
    status: Mapped[ProjectStatus] = mapped_column(PROJECT_STATUS_ENUM, nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    project: Mapped["Project"] = relationship(back_populates="versions")
    source_session: Mapped["WizardSession"] = relationship(
        back_populates="project_versions"
    )
    documents: Mapped[list["ProjectDocument"]] = relationship(back_populates="version")
    status_history: Mapped[list["ProjectStatusHistory"]] = relationship(back_populates="version")


class ProjectDocument(Base):
    __tablename__ = "project_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_export_artifact_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("export_artifacts.id", ondelete="SET NULL"), nullable=True
    )
    project_version_id: Mapped[int] = mapped_column(
        ForeignKey("project_versions.id", ondelete="CASCADE"), nullable=False
    )
    document_type: Mapped[str] = mapped_column(String(100))
    original_filename: Mapped[str] = mapped_column(String(255))
    storage_path: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    source_export_artifact: Mapped[Optional["ExportArtifact"]] = relationship(
        back_populates="project_documents"
    )
    version: Mapped["ProjectVersion"] = relationship(back_populates="documents")


class ProjectStatusHistory(Base):
    __tablename__ = "project_status_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_version_id: Mapped[int] = mapped_column(
        ForeignKey("project_versions.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[ProjectStatus] = mapped_column(PROJECT_STATUS_ENUM, nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    actor_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    actor: Mapped[Optional["User"]] = relationship(back_populates="status_changes")
    version: Mapped["ProjectVersion"] = relationship(back_populates="status_history")
