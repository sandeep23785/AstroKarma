"""Divisional chart (varga) computation. Currently D1 (Rāśi) and D9 (Navāṁśa)."""

from .nakshatra import nakshatra_of

_D9_SPAN = 30.0 / 9.0  # 3°20'


def d1_sign(lon: float) -> int:
    """Rāśi sign index (0-11) of a sidereal longitude."""
    return int((lon % 360.0) // 30.0)


def d9_sign(lon: float) -> int:
    """Navāṁśa sign index (0-11). The continuous formula floor(lon/3.3333) % 12
    reproduces the classical element-based starting signs."""
    return int((lon % 360.0) // _D9_SPAN) % 12


_SIGN_FN = {"D1": d1_sign, "D9": d9_sign}


def supported(key: str) -> bool:
    return key in _SIGN_FN


def build_varga(asc_lon: float, bodies: list[dict], key: str) -> dict:
    """Build {ascSign (1-12), houses[12][]} for a varga from stored longitudes.

    `bodies` is a list of {"code", "lon", ...}. Houses are whole-sign with
    house index 0 = the ascendant's sign (matching the chart renderer).
    """
    sign_fn = _SIGN_FN.get(key, d1_sign)
    asc_sign = sign_fn(asc_lon)
    houses: list[list[str]] = [[] for _ in range(12)]
    for b in bodies:
        s = sign_fn(b["lon"])
        house_index = (s - asc_sign) % 12
        houses[house_index].append(b["code"])
    return {"ascSign": asc_sign + 1, "houses": houses}


def enrich(asc_lon: float, bodies: list[dict]) -> dict:
    """Annotate each body with D1 sign/house, nakshatra, pada — for storage/display.

    Returns the positions blob stored on the chart:
    {"ascLon", "bodies":[{code,name,lon,sign,house,nakshatra,pada,retro}]}.
    """
    asc_sign = d1_sign(asc_lon)
    enriched: list[dict] = []
    for b in bodies:
        s = d1_sign(b["lon"])
        nak, pada = nakshatra_of(b["lon"])
        enriched.append(
            {
                "code": b["code"],
                "name": b.get("name", b["code"]),
                "lon": round(b["lon"], 4),
                "sign": s + 1,
                "house": ((s - asc_sign) % 12) + 1,
                "nakshatra": nak,
                "pada": pada,
                "retro": b["retro"],
            }
        )
    return {"ascLon": round(asc_lon, 4), "bodies": enriched}
