from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .. import drive_service
from ..auth import create_token, get_current_user
from ..config import settings
from ..deps import get_db
from ..models import User
from ..schemas import DriveAuthUrl, DriveStatus, DriveUploadIn, DriveUploadOut

router = APIRouter(prefix="/api/drive", tags=["drive"])


@router.get("/status", response_model=DriveStatus)
def status_(user: User = Depends(get_current_user)) -> DriveStatus:
    return DriveStatus(
        configured=drive_service.is_configured(),
        connected=bool(user.drive_refresh_token),
    )


@router.get("/auth-url", response_model=DriveAuthUrl)
def auth_url(user: User = Depends(get_current_user)) -> DriveAuthUrl:
    if not drive_service.is_configured():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Google Drive is not configured")
    # Carry the app session in `state` so the browser callback can identify the user.
    return DriveAuthUrl(url=drive_service.build_auth_url(state=create_token(user.id)))


@router.get("/callback")
def callback(code: str = "", state: str = "", db: Session = Depends(get_db)):
    if not code or not state:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Missing code/state")
    try:
        payload = jwt.decode(state, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user = db.get(User, payload.get("sub"))
    except JWTError:
        user = None
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid state")

    tokens = drive_service.exchange_code(code)
    refresh = tokens.get("refresh_token")
    if refresh:
        user.drive_refresh_token = refresh
        db.commit()
    # Back to the app (chart screen). The frontend re-checks Drive status on load.
    return RedirectResponse(url=f"{settings.web_app_url}/?drive=connected")


@router.post("/disconnect", status_code=status.HTTP_204_NO_CONTENT)
def disconnect(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.drive_refresh_token = None
    db.commit()


@router.post("/upload", response_model=DriveUploadOut)
def upload(
    payload: DriveUploadIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DriveUploadOut:
    if not user.drive_refresh_token:
        raise HTTPException(status.HTTP_409_CONFLICT, "Google Drive not connected")
    try:
        result = drive_service.upload_doc(
            user.drive_refresh_token, payload.filename, payload.contentBase64, payload.mime
        )
    except Exception as e:  # noqa: BLE001 — surface a readable message to the UI
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Drive upload failed: {e}")
    return DriveUploadOut(link=result.get("link"))
