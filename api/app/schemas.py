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


class DraftIn(BaseModel):
    name: str
    date: str = ""
    place: str = ""
    ascSign: int = 1
    houses: list[list[str]] = Field(default_factory=list)
    computed: bool = False


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
