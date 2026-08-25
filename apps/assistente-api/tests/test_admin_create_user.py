import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.api import admin as admin_module
from app.models import UserRole
from app.schemas import UserCreate


def test_admin_create_user_success():
    body = UserCreate(
        email="novo@exemplo.com",
        full_name="Novo Usuário",
        password="senha12345",
        role="researcher",
    )
    admin = SimpleNamespace(id=1, role=UserRole.admin)
    db = MagicMock()
    existing = MagicMock()
    existing.scalar_one_or_none.return_value = None
    db.execute = AsyncMock(return_value=existing)
    db.flush = AsyncMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.add = MagicMock()

    with patch.object(admin_module, "log_audit", new_callable=AsyncMock), patch.object(
        admin_module, "get_password_hash", return_value="hash:senha"
    ):
        user = asyncio.run(admin_module.create_user(body, admin, db))

    assert user.email == "novo@exemplo.com"
    assert user.role == UserRole.researcher
    db.add.assert_called_once()
    db.commit.assert_awaited()


def test_admin_create_user_duplicate_email():
    body = UserCreate(
        email="existente@exemplo.com",
        full_name="Existente",
        password="senha12345",
        role="admin",
    )
    admin = SimpleNamespace(id=1, role=UserRole.admin)
    db = MagicMock()
    existing = MagicMock()
    existing.scalar_one_or_none.return_value = SimpleNamespace(id=99)
    db.execute = AsyncMock(return_value=existing)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(admin_module.create_user(body, admin, db))
    assert exc.value.status_code == 400
