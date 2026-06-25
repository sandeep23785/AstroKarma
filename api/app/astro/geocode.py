"""Birth-place geocoding via OpenStreetMap Nominatim (no API key)."""

import httpx

_URL = "https://nominatim.openstreetmap.org/search"
_HEADERS = {"User-Agent": "AstroKarma/0.3 (personal study app)"}


def geocode(place: str) -> tuple[float, float, str] | None:
    """Return (lat, lon, display_name) for a place string, or None if not found."""
    try:
        resp = httpx.get(
            _URL,
            params={"q": place, "format": "json", "limit": 1},
            headers=_HEADERS,
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()
    except (httpx.HTTPError, ValueError):
        return None
    if not data:
        return None
    top = data[0]
    return float(top["lat"]), float(top["lon"]), top.get("display_name", place)
