from datetime import datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from dateutil import parser as date_parser
from fastapi import APIRouter, Depends, HTTPException, status

from ..astro import ephemeris, vargas
from ..astro.geocode import geocode
from ..auth import get_current_user
from ..models import User
from ..schemas import GenerateIn, GenerateOut

router = APIRouter(prefix="/api", tags=["generate"])


def _parse_local_datetime(date_str: str, time_str: str, tz: str) -> datetime:
    try:
        d = date_parser.parse(date_str, dayfirst=True, fuzzy=True)
    except (ValueError, OverflowError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Could not parse date: {date_str!r}")

    hour, minute = 12, 0
    if time_str:
        try:
            t = date_parser.parse(time_str, fuzzy=True)
            hour, minute = t.hour, t.minute
        except (ValueError, OverflowError):
            pass

    try:
        zone = ZoneInfo(tz)
    except (ZoneInfoNotFoundError, ValueError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unknown timezone: {tz!r}")

    return datetime(d.year, d.month, d.day, hour, minute, tzinfo=zone)


@router.post("/generate", response_model=GenerateOut)
def generate(payload: GenerateIn, _user: User = Depends(get_current_user)) -> GenerateOut:
    # Resolve coordinates: explicit lat/lon, else geocode the place string.
    if payload.lat is not None and payload.lon is not None:
        lat, lon, place = payload.lat, payload.lon, payload.place
    elif payload.place.strip():
        result = geocode(payload.place.strip())
        if result is None:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Could not find a location for {payload.place!r}. Try a more specific place.",
            )
        lat, lon, place = result
    else:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Provide a birth place or coordinates")

    local_dt = _parse_local_datetime(payload.date, payload.time, payload.tz)
    utc_dt = local_dt.astimezone(timezone.utc)
    jd_ut = ephemeris.julian_day_ut(
        utc_dt.year, utc_dt.month, utc_dt.day, utc_dt.hour + utc_dt.minute / 60.0
    )

    asc_lon, bodies = ephemeris.compute(jd_ut, lat, lon)
    d1 = vargas.build_varga(asc_lon, bodies, "D1")
    positions = vargas.enrich(asc_lon, bodies)

    return GenerateOut(
        ascSign=d1["ascSign"],
        houses=d1["houses"],
        positions=positions,
        lat=lat,
        lon=lon,
        tz=payload.tz,
        place=place,
    )
