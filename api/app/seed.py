from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from .models import Chart, Note, User

# Sample charts (ported from the prototype) inserted on first login so the
# library isn't empty. Listed newest-first; created_at is staggered to preserve order.
_SEED = [
    {
        "name": "Aarav Sharma",
        "date": "14 Aug 1991",
        "place": "04:32 · Pune, IN",
        "ascSign": 5,
        "houses": [["Su", "Me"], ["Ve"], [], ["Mo"], ["Ju"], ["Ra"], ["Sa"], [], [], ["Ma"], [], ["Ke"]],
        "note": (
            "Leo Lagna with Sun + Mercury in the 1st — strong sense of self, articulate, "
            "leadership wired into identity. Budha-Aditya yoga right on the ascendant.\n\n"
            "Mars in the 10th (Taurus) — steady, immovable career drive; persistence over aggression.\n"
            "Moon in the 4th (Scorpio) — emotional depth, private inner world, needs solitude to recharge.\n"
            "Saturn in the 7th — delayed but durable partnerships; growth through relationship.\n\n"
            "Watch: Rahu in the 6th channels into work & service; can over-identify with problems to solve."
        ),
    },
    {
        "name": "Self · natal",
        "date": "02 Mar 1994",
        "place": "09:10 · Jaipur, IN",
        "ascSign": 1,
        "houses": [[], [], ["Mo"], [], ["Su", "Me"], [], ["Sa"], [], [], ["Ju"], ["Ma"], ["Ve", "Ra"]],
        "note": "",
    },
    {
        "name": "Practice · Gandhi",
        "date": "02 Oct 1869",
        "place": "Porbandar, IN",
        "ascSign": 7,
        "houses": [[], ["Mo"], [], ["Ju"], [], [], ["Su", "Ve", "Ma", "Me"], ["Ke"], [], [], [], ["Sa", "Ra"]],
        "note": "",
    },
]


def ensure_seed(db: Session, user: User) -> None:
    """Insert sample charts the first time a user logs in (if they have none)."""
    has_any = db.query(Chart).filter(Chart.user_id == user.id).first() is not None
    if has_any:
        return
    now = datetime.utcnow()
    for i, s in enumerate(_SEED):
        # Stagger created_at so the first seed entry is newest (sorts first).
        created = now - timedelta(seconds=i)
        chart = Chart(
            user_id=user.id,
            name=s["name"],
            birth_date=s["date"],
            place=s["place"],
            asc_sign=s["ascSign"],
            houses=s["houses"],
            computed=False,
            created_at=created,
        )
        chart.note = Note(body=s["note"], saved_at=created if s["note"] else None)
        db.add(chart)
    db.commit()
