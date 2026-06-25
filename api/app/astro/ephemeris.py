"""Swiss Ephemeris wrapper — sidereal (Lahiri) positions.

Uses the Moshier ephemeris (no external data files needed), which is accurate to
within a few arc-seconds across the supported date range — ample for chart study.
"""

import swisseph as swe

# planet code -> (full name, Swiss Ephemeris body id)
_PLANETS: list[tuple[str, str, int]] = [
    ("Su", "Sun", swe.SUN),
    ("Mo", "Moon", swe.MOON),
    ("Ma", "Mars", swe.MARS),
    ("Me", "Mercury", swe.MERCURY),
    ("Ju", "Jupiter", swe.JUPITER),
    ("Ve", "Venus", swe.VENUS),
    ("Sa", "Saturn", swe.SATURN),
    ("Ra", "Rahu", swe.MEAN_NODE),  # mean lunar node
]

_FLAGS = swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED

PLANET_NAMES = {code: name for code, name, _ in _PLANETS}
PLANET_NAMES["Ke"] = "Ketu"


def _init() -> None:
    swe.set_sid_mode(swe.SIDM_LAHIRI)


def compute(jd_ut: float, lat: float, lon: float) -> tuple[float, list[dict]]:
    """Compute the sidereal ascendant longitude and planet longitudes.

    Returns (ascendant_longitude, bodies) where each body is
    {"code", "name", "lon", "retro"}.
    """
    _init()

    bodies: list[dict] = []
    for code, name, body_id in _PLANETS:
        values, _flag = swe.calc_ut(jd_ut, body_id, _FLAGS)
        longitude = values[0] % 360.0
        speed = values[3]
        bodies.append({"code": code, "name": name, "lon": longitude, "retro": speed < 0})

    # Ketu is always opposite Rahu.
    rahu = next(b["lon"] for b in bodies if b["code"] == "Ra")
    bodies.append(
        {"code": "Ke", "name": "Ketu", "lon": (rahu + 180.0) % 360.0, "retro": True}
    )

    # Whole-sign houses; ascmc[0] is the ascendant degree.
    _cusps, ascmc = swe.houses_ex(jd_ut, lat, lon, b"W", _FLAGS)
    asc_lon = ascmc[0] % 360.0

    return asc_lon, bodies


def julian_day_ut(year: int, month: int, day: int, hour: float) -> float:
    """Julian Day (UT) from a UTC calendar date and decimal hour."""
    return swe.julday(year, month, day, hour)
