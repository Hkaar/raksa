from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix='RAKSA_', env_file='.env', env_file_encoding='utf-8', extra='ignore',
    )

    app_name: str = 'RAKSA API'
    cors_origins: list[str] = []

    gemini_api_key: str | None = None
    gemini_model: str = 'gemini-3.8-flash'
    gemini_timeout_seconds: int = Field(default=12, ge=1, le=30)

    supabase_url: str | None = None
    supabase_publishable_key: str | None = None
    officer_email_domain: str | None = None

    officer_shortcut_enabled: bool = False
    officer_shortcut_email: str | None = None
    officer_shortcut_password: str | None = None
