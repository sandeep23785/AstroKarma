from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .config import settings
from .deps import get_db
from .models import User

bearer = HTTPBearer(auto_error=False)


def create_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=settings.jwt_expire_days)
    return jwt.encode(
        {"sub": user_id, "exp": exp}, settings.jwt_secret, algorithm=settings.jwt_algorithm
    )


def get_or_create_owner(db: Session, email: str, google_sub: str | None = None) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(email=email, google_sub=google_sub)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif google_sub and not user.google_sub:
        user.google_sub = google_sub
        db.commit()
    return user


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = jwt.decode(
            creds.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user
