from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from . import models  # noqa: F401  (ensure models are registered before create_all)
from .config import settings
from .db import Base, engine
from .routers import auth as auth_router
from .routers import charts as charts_router
from .routers import drive as drive_router
from .routers import generate as generate_router

app = FastAPI(title=settings.app_name, version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup. (Production would use Alembic migrations.)
Base.metadata.create_all(bind=engine)


def _ensure_columns() -> None:
    """Lightweight additive migration so existing local DBs gain new columns."""
    inspector = inspect(engine)
    chart_cols = {c["name"] for c in inspector.get_columns("charts")}
    user_cols = {c["name"] for c in inspector.get_columns("users")}
    with engine.begin() as conn:
        if "vargas" not in chart_cols:
            conn.execute(text("ALTER TABLE charts ADD COLUMN vargas JSON"))
        if "drive_refresh_token" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN drive_refresh_token VARCHAR"))


_ensure_columns()

app.include_router(auth_router.router)
app.include_router(charts_router.router)
app.include_router(generate_router.router)
app.include_router(drive_router.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}
