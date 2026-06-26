"""Google Drive integration for "Save to Drive".

Uploads a Word .doc (chart image + notes) into a "Astro Karma/charts" folder in
the owner's Drive. Uses the OAuth `drive.file` scope (app only sees files it
creates). Implemented with plain httpx — no extra Google client libraries.
"""

import base64

import httpx

from .config import settings

SCOPE = "https://www.googleapis.com/auth/drive.file"
_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
_TOKEN_URL = "https://oauth2.googleapis.com/token"
_FILES_URL = "https://www.googleapis.com/drive/v3/files"
_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files"

_FOLDER_MIME = "application/vnd.google-apps.folder"


def is_configured() -> bool:
    return bool(settings.google_client_id and settings.google_client_secret)


def build_auth_url(state: str) -> str:
    from urllib.parse import urlencode

    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",  # force a refresh_token every time
        "state": state,
    }
    return f"{_AUTH_URL}?{urlencode(params)}"


def exchange_code(code: str) -> dict:
    """Exchange an auth code for tokens. Returns the token response dict."""
    resp = httpx.post(
        _TOKEN_URL,
        data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=15.0,
    )
    resp.raise_for_status()
    return resp.json()


def _access_token(refresh_token: str) -> str:
    resp = httpx.post(
        _TOKEN_URL,
        data={
            "refresh_token": refresh_token,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "grant_type": "refresh_token",
        },
        timeout=15.0,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def _find_or_create_folder(token: str, name: str, parent: str | None) -> str:
    headers = {"Authorization": f"Bearer {token}"}
    q = (
        f"name='{name}' and mimeType='{_FOLDER_MIME}' and trashed=false"
        + (f" and '{parent}' in parents" if parent else "")
    )
    r = httpx.get(_FILES_URL, headers=headers, params={"q": q, "fields": "files(id)"}, timeout=15.0)
    r.raise_for_status()
    files = r.json().get("files", [])
    if files:
        return files[0]["id"]
    meta: dict = {"name": name, "mimeType": _FOLDER_MIME}
    if parent:
        meta["parents"] = [parent]
    r = httpx.post(_FILES_URL, headers=headers, json=meta, params={"fields": "id"}, timeout=15.0)
    r.raise_for_status()
    return r.json()["id"]


def upload_doc(refresh_token: str, filename: str, content_b64: str, mime: str) -> dict:
    """Upload (or update) a .doc into Astro Karma/charts. Returns {id, link}."""
    token = _access_token(refresh_token)
    headers = {"Authorization": f"Bearer {token}"}

    root = _find_or_create_folder(token, "Astro Karma", None)
    folder = _find_or_create_folder(token, "charts", root)

    content = base64.b64decode(content_b64)

    # Replace an existing file with the same name in the folder (so re-saving updates it).
    q = f"name='{filename}' and '{folder}' in parents and trashed=false"
    r = httpx.get(_FILES_URL, headers=headers, params={"q": q, "fields": "files(id)"}, timeout=15.0)
    r.raise_for_status()
    existing = r.json().get("files", [])

    metadata = {"name": filename, "parents": [folder]}
    files = {
        "metadata": ("metadata", _json(metadata), "application/json; charset=UTF-8"),
        "file": (filename, content, mime),
    }

    if existing:
        file_id = existing[0]["id"]
        # Update media of the existing file (metadata parents can't change on update).
        up = httpx.patch(
            f"{_UPLOAD_URL}/{file_id}",
            headers=headers,
            params={"uploadType": "media", "fields": "id,webViewLink"},
            content=content,
            timeout=30.0,
        )
        up.raise_for_status()
        data = up.json()
    else:
        up = httpx.post(
            _UPLOAD_URL,
            headers=headers,
            params={"uploadType": "multipart", "fields": "id,webViewLink"},
            files=files,
            timeout=30.0,
        )
        up.raise_for_status()
        data = up.json()

    return {"id": data.get("id"), "link": data.get("webViewLink")}


def _json(obj: dict) -> bytes:
    import json

    return json.dumps(obj).encode("utf-8")
