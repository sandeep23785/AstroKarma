import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _uuid() -> str:
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    google_sub: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Chart(Base):
    __tablename__ = "charts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String)
    birth_date: Mapped[str] = mapped_column(String, default="—")
    place: Mapped[str] = mapped_column(String, default="")
    asc_sign: Mapped[int] = mapped_column(Integer, default=1)
    houses: Mapped[list] = mapped_column(JSON, default=list)
    computed: Mapped[bool] = mapped_column(Boolean, default=False)
    positions: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Manual divisional charts keyed by varga (D9, D10, ...): {key: {ascSign, houses}}.
    # D1 lives in asc_sign/houses above.
    vargas: Mapped[dict | None] = mapped_column(JSON, default=dict, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    note: Mapped["Note"] = relationship(
        back_populates="chart", uselist=False, cascade="all, delete-orphan"
    )


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    chart_id: Mapped[str] = mapped_column(
        ForeignKey("charts.id", ondelete="CASCADE"), unique=True, index=True
    )
    body: Mapped[str] = mapped_column(Text, default="")
    saved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    chart: Mapped["Chart"] = relationship(back_populates="note")


# Defined now for a stable schema; populated by the AI flashcard feature in Phase 5.
class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    chart_id: Mapped[str] = mapped_column(ForeignKey("charts.id", ondelete="CASCADE"), index=True)
    front: Mapped[str] = mapped_column(Text)
    back: Mapped[str] = mapped_column(Text)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    planet: Mapped[str | None] = mapped_column(String, nullable=True)
    house: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sign: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String, default="ai")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
