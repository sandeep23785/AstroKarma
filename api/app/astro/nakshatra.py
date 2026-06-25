NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

_NAK_SPAN = 360.0 / 27.0  # 13°20'
_PADA_SPAN = _NAK_SPAN / 4.0  # 3°20'


def nakshatra_of(lon: float) -> tuple[str, int]:
    """Return (nakshatra name, pada 1-4) for a sidereal longitude."""
    lon = lon % 360.0
    idx = int(lon // _NAK_SPAN)
    pada = int((lon % _NAK_SPAN) // _PADA_SPAN) + 1
    return NAKSHATRAS[idx], pada
