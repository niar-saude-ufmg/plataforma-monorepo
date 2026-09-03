from collections.abc import AsyncGenerator
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()


def _normalize_async_database_url(url: str) -> str:
    if url.startswith("postgresql://"):
        normalized = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        normalized = url.replace("postgres://", "postgresql+asyncpg://", 1)
    else:
        normalized = url

    parts = urlsplit(normalized)
    filtered_query = [(key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True) if key != "sslmode"]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(filtered_query), parts.fragment))


def _build_connect_args() -> dict:
    connect_args = {
        "server_settings": {
            "search_path": settings.db_search_path,
        }
    }

    query_params = dict(parse_qsl(urlsplit(settings.database_url).query, keep_blank_values=True))
    sslmode = query_params.get("sslmode")

    if sslmode == "disable":
        connect_args["ssl"] = False

    return connect_args

engine = create_async_engine(
    _normalize_async_database_url(settings.database_url),
    echo=False,
    connect_args=_build_connect_args(),
)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
