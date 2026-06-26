from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Astro Karma API"
    environment: str = "development"

    database_url: str = "sqlite:///./astrokarma.db"
    cors_origins: str = "http://localhost:5173"

    # Auth
    owner_email: str = "owner@astrokarma.local"
    google_client_id: str = ""
    google_client_secret: str = ""
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 30

    # Google Drive (Save to Drive). Uses the same OAuth client as login.
    google_redirect_uri: str = "http://localhost:8077/api/drive/callback"
    web_app_url: str = "http://localhost:5173"

    # AI (later phase)
    anthropic_api_key: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
