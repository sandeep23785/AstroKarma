from pydantic import BaseModel, Field


class NoteOut(BaseModel):
    whole: str


class ChartOut(BaseModel):
    id: str
    name: str
    date: str
    place: str
    ascSign: int
    houses: list[list[str]]
    notes: NoteOut
    savedAt: int | None
    positions: dict | None = None


class DraftIn(BaseModel):
    name: str
    date: str = ""
    place: str = ""
    ascSign: int = 1
    houses: list[list[str]] = Field(default_factory=list)
    computed: bool = False
    positions: dict | None = None


class GenerateIn(BaseModel):
    date: str
    time: str = "12:00"
    place: str = ""
    lat: float | None = None
    lon: float | None = None
    tz: str = "Asia/Kolkata"


class GenerateOut(BaseModel):
    ascSign: int
    houses: list[list[str]]
    positions: dict
    lat: float
    lon: float
    tz: str
    place: str


class VargaOut(BaseModel):
    ascSign: int
    houses: list[list[str]]


class NoteIn(BaseModel):
    body: str


class UserOut(BaseModel):
    id: str
    email: str


class GoogleLoginIn(BaseModel):
    credential: str


class TokenOut(BaseModel):
    token: str
    user: UserOut
