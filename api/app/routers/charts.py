from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..deps import get_db
from ..models import Chart, Note, User
from ..schemas import ChartOut, DraftIn, NoteIn

router = APIRouter(prefix="/api/charts", tags=["charts"])


def _to_ms(dt) -> int | None:
    if dt is None:
        return None
    return int(dt.replace(tzinfo=timezone.utc).timestamp() * 1000)


def serialize(c: Chart) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "date": c.birth_date,
        "place": c.place,
        "ascSign": c.asc_sign,
        "houses": c.houses or [],
        "notes": {"whole": c.note.body if c.note else ""},
        "savedAt": _to_ms(c.note.saved_at if c.note else None),
    }


def _owned(db: Session, user: User, chart_id: str) -> Chart:
    chart = db.get(Chart, chart_id)
    if chart is None or chart.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Chart not found")
    return chart


@router.get("", response_model=list[ChartOut])
def list_charts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    charts = (
        db.query(Chart)
        .filter(Chart.user_id == user.id)
        .order_by(Chart.created_at.desc())
        .all()
    )
    return [serialize(c) for c in charts]


@router.post("", response_model=ChartOut)
def create_chart(d: DraftIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chart = Chart(
        user_id=user.id,
        name=d.name.strip(),
        birth_date=d.date or "—",
        place=d.place or "",
        asc_sign=d.ascSign,
        houses=d.houses,
        computed=d.computed,
    )
    chart.note = Note(body="")
    db.add(chart)
    db.commit()
    db.refresh(chart)
    return serialize(chart)


@router.get("/{chart_id}", response_model=ChartOut)
def get_chart(chart_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return serialize(_owned(db, user, chart_id))


@router.put("/{chart_id}", response_model=ChartOut)
def update_chart(
    chart_id: str, d: DraftIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    chart = _owned(db, user, chart_id)
    chart.name = d.name.strip()
    chart.birth_date = d.date or "—"
    chart.place = d.place or ""
    chart.asc_sign = d.ascSign
    chart.houses = d.houses
    chart.computed = d.computed
    db.commit()
    db.refresh(chart)
    return serialize(chart)


@router.post("/{chart_id}/duplicate", response_model=ChartOut)
def duplicate_chart(
    chart_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    src = _owned(db, user, chart_id)
    copy = Chart(
        user_id=user.id,
        name=src.name + " (copy)",
        birth_date=src.birth_date,
        place=src.place,
        asc_sign=src.asc_sign,
        houses=src.houses,
        computed=src.computed,
    )
    copy.note = Note(body=src.note.body if src.note else "")
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return serialize(copy)


@router.delete("/{chart_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chart(
    chart_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    chart = _owned(db, user, chart_id)
    db.delete(chart)
    db.commit()


@router.put("/{chart_id}/note", response_model=ChartOut)
def save_note(
    chart_id: str,
    payload: NoteIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from datetime import datetime

    chart = _owned(db, user, chart_id)
    if chart.note is None:
        chart.note = Note(body=payload.body)
    else:
        chart.note.body = payload.body
    chart.note.saved_at = datetime.utcnow()
    db.commit()
    db.refresh(chart)
    return serialize(chart)
