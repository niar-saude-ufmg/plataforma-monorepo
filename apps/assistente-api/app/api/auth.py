from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import get_password_hash
from app.models import User, UserRole
from app.schemas import UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    settings = get_settings()
    if not settings.allow_registration:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cadastro desabilitado")
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado")
    role = UserRole.admin if body.role == "admin" else UserRole.researcher
    user = User(
        email=body.email,
        full_name=body.full_name,
        hashed_password=get_password_hash(body.password),
        role=role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
