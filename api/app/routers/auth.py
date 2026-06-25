from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import create_token, get_current_user, get_or_create_owner
from ..config import settings
from ..deps import get_db
from ..models import User
from ..schemas import GoogleLoginIn, TokenOut, UserOut
from ..seed import ensure_seed

router = APIRouter(prefix="/api/auth", tags=["auth"])

_PLACEHOLDER_OWNER = "owner@astrokarma.local"


@router.post("/dev-login", response_model=TokenOut)
def dev_login(db: Session = Depends(get_db)) -> TokenOut:
    """Single-user local login (development only). Provisions the owner + seeds samples."""
    if settings.environment != "development":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Dev login is disabled")
    user = get_or_create_owner(db, settings.owner_email)
    ensure_seed(db, user)
    return TokenOut(token=create_token(user.id), user=UserOut(id=user.id, email=user.email))


@router.post("/google", response_model=TokenOut)
def google_login(payload: GoogleLoginIn, db: Session = Depends(get_db)) -> TokenOut:
    """Production login: verify a Google ID token, gate to the owner, issue a JWT."""
    if not settings.google_client_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Google auth is not configured")

    from google.auth.transport import requests as g_requests
    from google.oauth2 import id_token

    try:
        info = id_token.verify_oauth2_token(
            payload.credential, g_requests.Request(), settings.google_client_id
        )
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid Google credential")

    email = info.get("email")
    sub = info.get("sub")
    # If an owner email is configured (not the placeholder), restrict access to it.
    if settings.owner_email and settings.owner_email != _PLACEHOLDER_OWNER and email != settings.owner_email:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorized")

    user = get_or_create_owner(db, email, sub)
    ensure_seed(db, user)
    return TokenOut(token=create_token(user.id), user=UserOut(id=user.id, email=user.email))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut(id=user.id, email=user.email)
